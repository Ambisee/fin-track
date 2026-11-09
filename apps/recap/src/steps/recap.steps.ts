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
import { logger } from "../logger"
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
	logger.info("ensurePeriodStep", `Start - Period: ${periodKey}`)
	const { log } = await getContainer()
	logger.debug(
		"ensurePeriodStep",
		`Ensuring cutoff record for period: ${periodKey}`
	)
	const result = await log.ensurePeriod(periodKey)
	logger.info(
		"ensurePeriodStep",
		`End - Period: ${periodKey}, Status: success, Cutoff: ${result.cutoffIso}`
	)
	return result
}

/** One call to the existing users API. The persisted result is the run's snapshot of who gets a recap. */
export async function fetchRecipientsStep(): Promise<RecapUser[]> {
	"use step"
	logger.info("fetchRecipientsStep", "Start - Fetching opted-in recipients")
	const { source } = await getContainer()
	logger.debug(
		"fetchRecipientsStep",
		"Querying data source for eligible users and ledgers"
	)
	const recipients = await source.fetchOptedInUserDataList()
	logger.info(
		"fetchRecipientsStep",
		`End - Status: success, Total recipients: ${recipients.length}`
	)
	return recipients
}

export async function claimDeliveryStep(periodKey: string, userId: string) {
	"use step"
	logger.info(
		"claimDeliveryStep",
		`Start - User: ${userId}, Period: ${periodKey}`
	)
	const { log } = await getContainer()
	logger.debug(
		"claimDeliveryStep",
		`Acquiring delivery lease (${DELIVERY_LEASE_SECONDS}s) - User: ${userId}, Period: ${periodKey}`
	)
	const claim = await log.claimDelivery(
		periodKey,
		userId,
		DELIVERY_LEASE_SECONDS
	)
	logger.info("claimDeliveryStep", `End - User: ${userId}, Status: ${claim}`)
	return claim
}

/** Reads all of a user's entries for the period, in batches, grouped by ledger. */
export async function fetchEntriesStep(args: {
	ledgerIds: string[]
	periodKey: string
	cutoffIso: string
	userId?: string
}): Promise<LedgerEntries[]> {
	"use step"
	const userContext = args.userId ? `User: ${args.userId}, ` : ""
	logger.info(
		"fetchEntriesStep",
		`Start - ${userContext}Period: ${args.periodKey}, Ledgers: ${args.ledgerIds.length}`
	)
	const { source: entrySource } = await getContainer()
	logger.debug(
		"fetchEntriesStep",
		`${userContext}Fetching entries up to cutoff: ${args.cutoffIso}`
	)
	const entries = await entrySource.fetchLedgerEntries(
		args.ledgerIds,
		parsePeriodKey(args.periodKey),
		args.cutoffIso
	)
	const totalEntries = entries.reduce(
		(acc, curr) => acc + curr.entries.length,
		0
	)
	logger.info(
		"fetchEntriesStep",
		`End - ${userContext}Status: success, Retrieved ${totalEntries} entries across ${entries.length} active ledgers`
	)
	return entries
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
	const { user, ledger, periodKey, entries, cutoffIso } = args
	logger.info(
		"buildLedgerReportStep",
		`Start - User: ${user.id}, Ledger: ${ledger.name} (${ledger.id}), Entries: ${entries.length}`
	)
	const { renderer, storage } = await getContainer()

	try {
		logger.debug(
			"buildLedgerReportStep",
			`Rendering PDF report - User: ${user.id}, Ledger: ${ledger.name}`
		)
		const pdf = await renderer.render({
			username: user.username,
			ledgerName: ledger.name,
			currency: ledger.currency,
			locale: user.locale,
			period: parsePeriodKey(periodKey),
			entries,
			generatedAtIso: cutoffIso
		})

		// Deterministic key + overwrite: a retried or duplicated step converges on the same object.
		const storageKey = reportKey(periodKey, user.id, ledger.id)
		logger.debug(
			"buildLedgerReportStep",
			`Uploading PDF report (${pdf.byteLength} bytes) to storage key: ${storageKey} - User: ${user.id}`
		)
		await storage.put(storageKey, pdf)

		const outcome: LedgerOutcome = {
			ledgerId: ledger.id,
			ledgerName: ledger.name,
			status: "included",
			entryCount: entries.length,
			storageKey,
			fileName: reportFileName(ledger.name, periodKey),
			sizeBytes: pdf.byteLength
		}
		logger.info(
			"buildLedgerReportStep",
			`End - User: ${user.id}, Ledger: ${ledger.name}, Status: included, Size: ${pdf.byteLength} bytes`
		)
		return outcome
	} catch (err) {
		const errorMessage = err instanceof Error ? err.message : String(err)
		logger.error(
			"buildLedgerReportStep",
			`End - User: ${user.id}, Ledger: ${ledger.name}, Status: error, Reason: ${errorMessage}`
		)
		throw err
	}
}

export async function sendRecapEmailStep(args: {
	recipient: MailRecipient
	periodKey: string
	outcomes: LedgerOutcome[]
	userId?: string
}): Promise<{ omittedLedgerIds: string[] }> {
	"use step"
	const userContext = args.userId ? `User: ${args.userId}, ` : ""
	logger.info(
		"sendRecapEmailStep",
		`Start - ${userContext}Recipient: ${args.recipient.email}, Period: ${args.periodKey}, Total outcomes: ${args.outcomes.length}`
	)
	const { storage, mailer } = await getContainer()
	const { recipient, periodKey, outcomes } = args

	const included = outcomes.filter((o) => o.status === "included")
	const plan = planAttachments(included, MAX_ATTACHMENT_BYTES)
	const totalBytes = plan.include.reduce((sum, o) => sum + o.sizeBytes, 0)
	logger.debug(
		"sendRecapEmailStep",
		`${userContext}Attachment planning: ${plan.include.length} included, ${plan.omitted.length} omitted (${totalBytes}/${MAX_ATTACHMENT_BYTES} bytes)`
	)
	if (plan.omitted.length > 0) {
		logger.warning(
			"sendRecapEmailStep",
			`${userContext}Omitted ${plan.omitted.length} attachments exceeding max size limit`
		)
	}

	const missing = [
		...outcomes.filter((o) => o.status === "failed"),
		...plan.omitted
	]

	const names = uniqueFileNames(plan.include.map((o) => o.fileName))
	logger.debug(
		"sendRecapEmailStep",
		`${userContext}Downloading ${plan.include.length} attachments from storage`
	)
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
		logger.debug(
			"sendRecapEmailStep",
			`${userContext}Dispatching email to ${recipient.email} via mailer`
		)
		await mailer.send({ ...message, attachments })
		logger.info(
			"sendRecapEmailStep",
			`End - ${userContext}Status: sent, Attachments sent: ${attachments.length}, Omitted: ${plan.omitted.length}`
		)
	} catch (err) {
		const errorMessage = err instanceof Error ? err.message : String(err)
		if (err instanceof PermanentMailError) {
			logger.error(
				"sendRecapEmailStep",
				`End - ${userContext}Status: permanent_failure, Reason: ${errorMessage}`
			)
			throw new FatalError(err.message)
		}
		// Transient (4xx, network, Gmail throttling): back off instead of hammering SMTP.
		const { attempt } = getStepMetadata()
		logger.warning(
			"sendRecapEmailStep",
			`${userContext}Status: retryable_failure, Attempt: ${attempt}, Reason: ${errorMessage}`
		)
		throw new RetryableError(errorMessage, {
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
	logger.info(
		"finalizeDeliveryStep",
		`Start - User: ${args.userId}, Period: ${args.periodKey}, Target status: ${args.status}`
	)
	const { log } = await getContainer()
	logger.debug(
		"finalizeDeliveryStep",
		`Updating delivery record - User: ${args.userId}, Status: ${args.status}${args.error ? `, Error: ${args.error}` : ""}`
	)
	await log.completeDelivery(args.periodKey, args.userId, {
		status: args.status,
		outcomes: args.outcomes,
		error: args.error
	})
	logger.info(
		"finalizeDeliveryStep",
		`End - User: ${args.userId}, Status: ${args.status}`
	)
}
