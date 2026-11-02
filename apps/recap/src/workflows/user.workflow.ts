import { markOmitted } from "../domain/email"
import { partitionLedgers, sortByLedgerOrder } from "../domain/ledgers"
import type { LedgerOutcome, RecapUser } from "../domain/types"
import { localeOf } from "../domain/users"
import {
	buildLedgerReportStep,
	claimDeliveryStep,
	fetchEntriesStep,
	finalizeDeliveryStep,
	sendRecapEmailStep
} from "../steps/recap.steps"

const messageOf = (e: unknown) => (e instanceof Error ? e.message : String(e))

/**
 * WFUser: one recap email for one user. It receives the whole user record from WFInit.
 *
 *  claim -> fetch entries in batches -> drop ledgers with no entries -> one PDF per remaining ledger (parallel)
 *        -> one email -> finalize
 *
 * Partial recap policy: a ledger whose report still fails after its retries is recorded and left out; the
 * email goes out with the rest and names what is missing. A failed entries fetch is all-or-nothing: the
 * delivery is marked `failed` (reclaimable) and nothing is sent.
 */
export async function userRecapWorkflow(
	user: RecapUser,
	periodKey: string,
	cutoffIso: string
) {
	"use workflow"

	// Duplicate cron deliveries and reruns converge here: only one run may own a (period, user).
	const claim = await claimDeliveryStep(periodKey, user.id)
	if (claim !== "claimed") {
		return { userId: user.id, status: claim === "done" ? "already_delivered" : "in_progress" } as const
	}

	let outcomes: LedgerOutcome[] = []
	let emailSent = false
	try {
		const fetched = await fetchEntriesStep({
			ledgerIds: user.ledgers.map((l) => l.id),
			periodKey,
			cutoffIso
		})
		const { active, empty } = partitionLedgers(user.ledgers, fetched)
		const emptyOutcomes = empty.map(
			(l): LedgerOutcome => ({ ledgerId: l.id, ledgerName: l.name, status: "empty" })
		)

		if (active.length === 0) {
			await finalizeDeliveryStep({ periodKey, userId: user.id, status: "skipped_empty", outcomes: emptyOutcomes })
			return { userId: user.id, status: "skipped" } as const
		}

		const reportUser = { id: user.id, username: user.username, locale: localeOf(user) }
		const settled = await Promise.allSettled(
			active.map(({ ledger, entries }) =>
				buildLedgerReportStep({ user: reportUser, periodKey, cutoffIso, ledger, entries })
			)
		)
		const built = settled.map((r, i): LedgerOutcome =>
			r.status === "fulfilled"
				? r.value
				: {
						ledgerId: active[i].ledger.id,
						ledgerName: active[i].ledger.name,
						status: "failed",
						error: messageOf(r.reason)
					}
		)
		outcomes = sortByLedgerOrder(user.ledgers, [...built, ...emptyOutcomes])

		if (!built.some((o) => o.status === "included")) {
			// Every ledger with activity failed: nothing to send. Stays reclaimable for the next trigger.
			await finalizeDeliveryStep({
				periodKey,
				userId: user.id,
				status: "failed",
				outcomes,
				error: "every ledger with activity failed to render"
			})
			return { userId: user.id, status: "failed" } as const
		}

		const { omittedLedgerIds } = await sendRecapEmailStep({
			recipient: { email: user.email, username: user.username, locale: user.locale },
			periodKey,
			outcomes
		})
		emailSent = true
		outcomes = markOmitted(outcomes, omittedLedgerIds)

		await finalizeDeliveryStep({ periodKey, userId: user.id, status: "sent", outcomes })
		return {
			userId: user.id,
			status: "sent",
			included: outcomes.filter((o) => o.status === "included").length,
			failed: outcomes.filter((o) => o.status === "failed").length
		} as const
	} catch (err) {
		// Unexpected failure after the claim. If the email already left, say so; otherwise free the
		// delivery so a re-trigger can retry it instead of waiting out the lease.
		await finalizeDeliveryStep({
			periodKey,
			userId: user.id,
			status: emailSent ? "sent" : "failed",
			outcomes,
			error: messageOf(err)
		})
		return { userId: user.id, status: emailSent ? "sent" : "failed" } as const
	}
}
