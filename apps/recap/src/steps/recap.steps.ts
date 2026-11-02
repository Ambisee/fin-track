import { FatalError, RetryableError, getStepMetadata } from "workflow"
import { getContainer } from "../container"
import {
	composeEmail,
	planAttachments,
	uniqueFileNames,
	type MailRecipient
} from "../domain/email"
import { reportFileName, reportKey } from "../domain/naming"
import { parsePeriodKey } from "../domain/period"
import { PermanentMailError } from "../domain/ports"
import type {
	DeliveryStatus,
	LedgerEntries,
	LedgerInfo,
	LedgerOutcome,
	RecapUser,
	ReportEntry
} from "../domain/types"
import {
	DELIVERY_LEASE_SECONDS,
	MAX_ATTACHMENT_BYTES
} from "../workflows/policy"

/**
 * Every function here is a durable step: its result is persisted once it succeeds, so a replay never
 * re-runs it. Steps get the container lazily; nothing at module load touches the network or env.
 */

export async function ensurePeriodStep(periodKey: string) {
	"use step"
	const { log } = await getContainer()
	return log.ensurePeriod(periodKey)
}

/** One call to the existing users API. The persisted result is the run's snapshot of who gets a recap. */
export async function fetchRecipientsStep(): Promise<RecapUser[]> {
	"use step"
	const { source } = await getContainer()
	return await source.fetchOptedInUserDataList()
}

export async function claimDeliveryStep(periodKey: string, userId: string) {
	"use step"
	const { log } = await getContainer()
	return log.claimDelivery(periodKey, userId, DELIVERY_LEASE_SECONDS)
}

/** Reads all of a user's entries for the period, in batches, grouped by ledger. */
export async function fetchEntriesStep(args: {
	ledgerIds: string[]
	periodKey: string
	cutoffIso: string
}): Promise<LedgerEntries[]> {
	"use step"
	const { source: entrySource } = await getContainer()
	return entrySource.fetchLedgerEntries(
		args.ledgerIds,
		parsePeriodKey(args.periodKey),
		args.cutoffIso
	)
}

/** Renders one ledger's PDF and stores it; returns only a reference, never the bytes. */
export async function buildLedgerReportStep(args: {
	user: { id: string; username: string; locale: string }
	periodKey: string
	cutoffIso: string
	ledger: LedgerInfo
	entries: ReportEntry[]
}): Promise<LedgerOutcome> {
	"use step"
	const { renderer, storage } = await getContainer()
	const { user, ledger, periodKey } = args

	const pdf = await renderer.render({
		username: user.username,
		ledgerName: ledger.name,
		currency: ledger.currency,
		locale: user.locale,
		period: parsePeriodKey(periodKey),
		entries: args.entries,
		generatedAtIso: args.cutoffIso
	})

	// Deterministic key + overwrite: a retried or duplicated step converges on the same object.
	const storageKey = reportKey(periodKey, user.id, ledger.id)
	await storage.put(storageKey, pdf)

	return {
		ledgerId: ledger.id,
		ledgerName: ledger.name,
		status: "included",
		entryCount: args.entries.length,
		storageKey,
		fileName: reportFileName(ledger.name, periodKey),
		sizeBytes: pdf.byteLength
	}
}

export async function sendRecapEmailStep(args: {
	recipient: MailRecipient
	periodKey: string
	outcomes: LedgerOutcome[]
}): Promise<{ omittedLedgerIds: string[] }> {
	"use step"
	const { storage, mailer } = await getContainer()
	const { recipient, periodKey, outcomes } = args

	const included = outcomes.filter((o) => o.status === "included")
	const plan = planAttachments(included, MAX_ATTACHMENT_BYTES)
	const missing = [
		...outcomes.filter((o) => o.status === "failed"),
		...plan.omitted
	]

	const names = uniqueFileNames(plan.include.map((o) => o.fileName))
	const attachments = await Promise.all(
		plan.include.map(async (o, i) => ({
			filename: names[i],
			content: await storage.get(o.storageKey),
			contentType: "application/pdf"
		}))
	)

	const message = composeEmail({
		recipient,
		period: parsePeriodKey(periodKey),
		attached: plan.include,
		missing
	})

	try {
		await mailer.send({ ...message, attachments })
	} catch (err) {
		if (err instanceof PermanentMailError) throw new FatalError(err.message)
		// Transient (4xx, network, Gmail throttling): back off instead of hammering SMTP.
		const { attempt } = getStepMetadata()
		throw new RetryableError(err instanceof Error ? err.message : String(err), {
			retryAfter: Math.min(attempt ** 2 * 15_000, 5 * 60_000)
		})
	}
	return { omittedLedgerIds: plan.omitted.map((o) => o.ledgerId) }
}
// Gmail SMTP is flaky under load; allow a few more attempts than the default 3.
sendRecapEmailStep.maxRetries = 5

export async function finalizeDeliveryStep(args: {
	periodKey: string
	userId: string
	status: DeliveryStatus
	outcomes: LedgerOutcome[]
	error?: string
}) {
	"use step"
	const { log } = await getContainer()
	await log.completeDelivery(args.periodKey, args.userId, {
		status: args.status,
		outcomes: args.outcomes,
		error: args.error
	})
}
