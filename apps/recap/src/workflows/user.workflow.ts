import { markOmitted } from "../domain/email"
import { partitionLedgers, sortByLedgerOrder } from "../domain/ledgers"
import type { LedgerOutcome, RecapUser } from "../domain/types"
import { localeOf } from "../domain/users"
import { logger } from "../logger"
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

	logger.info(
		"userRecapWorkflow",
		`Workflow start - User: ${user.id} (${user.username}), Period: ${periodKey}`
	)

	// Duplicate cron deliveries and reruns converge here: only one run may own a (period, user).
	const claim = await claimDeliveryStep(periodKey, user.id)
	if (claim !== "claimed") {
		const status = claim === "done" ? "already_delivered" : "in_progress"
		logger.info(
			"userRecapWorkflow",
			`Workflow end - User: ${user.id}, Status: ${status} (Claim outcome: ${claim})`
		)
		return { userId: user.id, status } as const
	}

	let outcomes: LedgerOutcome[] = []
	let emailSent = false
	try {
		logger.debug(
			"userRecapWorkflow",
			`User: ${user.id}, Fetching entries for ${user.ledgers.length} ledgers`
		)
		const fetched = await fetchEntriesStep({
			userId: user.id,
			ledgerIds: user.ledgers.map((l) => l.id),
			periodKey,
			cutoffIso
		})
		const { active, empty } = partitionLedgers(user.ledgers, fetched)
		const emptyOutcomes = empty.map(
			(l): LedgerOutcome => ({
				ledgerId: l.id,
				ledgerName: l.name,
				status: "empty"
			})
		)
		logger.debug(
			"userRecapWorkflow",
			`User: ${user.id}, Partitioned ledgers: ${active.length} active, ${empty.length} empty`
		)

		if (active.length === 0) {
			logger.info(
				"userRecapWorkflow",
				`User: ${user.id}, No active ledgers with entries. Finalizing delivery with status: skipped_empty`
			)
			await finalizeDeliveryStep({
				periodKey,
				userId: user.id,
				status: "skipped_empty",
				outcomes: emptyOutcomes
			})
			logger.info(
				"userRecapWorkflow",
				`Workflow end - User: ${user.id}, Status: skipped`
			)
			return { userId: user.id, status: "skipped" } as const
		}

		logger.debug(
			"userRecapWorkflow",
			`User: ${user.id}, Building reports for ${active.length} active ledgers in parallel`
		)
		const reportUser = {
			id: user.id,
			username: user.username,
			locale: localeOf(user)
		}
		const settled = await Promise.allSettled(
			active.map(({ ledger, entries }) =>
				buildLedgerReportStep({
					user: reportUser,
					periodKey,
					cutoffIso,
					ledger,
					entries
				})
			)
		)
		const built = settled.map(
			(r, i): LedgerOutcome =>
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

		const includedCount = built.filter((o) => o.status === "included").length
		const failedCount = built.filter((o) => o.status === "failed").length
		logger.debug(
			"userRecapWorkflow",
			`User: ${user.id}, Reports built: ${includedCount} included, ${failedCount} failed, ${empty.length} empty`
		)

		if (!built.some((o) => o.status === "included")) {
			// Every ledger with activity failed: nothing to send. Stays reclaimable for the next trigger.
			logger.warning(
				"userRecapWorkflow",
				`User: ${user.id}, Every active ledger failed to render. Finalizing delivery with status: failed`
			)
			await finalizeDeliveryStep({
				periodKey,
				userId: user.id,
				status: "failed",
				outcomes,
				error: "every ledger with activity failed to render"
			})
			logger.info(
				"userRecapWorkflow",
				`Workflow end - User: ${user.id}, Status: failed`
			)
			return { userId: user.id, status: "failed" } as const
		}

		logger.debug(
			"userRecapWorkflow",
			`User: ${user.id}, Dispatching recap email for period: ${periodKey}`
		)
		const { omittedLedgerIds } = await sendRecapEmailStep({
			userId: user.id,
			recipient: {
				email: user.email,
				username: user.username,
				locale: user.locale
			},
			periodKey,
			outcomes
		})
		emailSent = true
		outcomes = markOmitted(outcomes, omittedLedgerIds)

		logger.debug(
			"userRecapWorkflow",
			`User: ${user.id}, Finalizing delivery with status: sent`
		)
		await finalizeDeliveryStep({
			periodKey,
			userId: user.id,
			status: "sent",
			outcomes
		})
		logger.info(
			"userRecapWorkflow",
			`Workflow end - User: ${user.id}, Status: sent, Included: ${outcomes.filter((o) => o.status === "included").length}, Failed: ${outcomes.filter((o) => o.status === "failed").length}`
		)
		return {
			userId: user.id,
			status: "sent",
			included: outcomes.filter((o) => o.status === "included").length,
			failed: outcomes.filter((o) => o.status === "failed").length
		} as const
	} catch (err) {
		const finalStatus = emailSent ? "sent" : "failed"
		logger.error(
			"userRecapWorkflow",
			`Workflow error - User: ${user.id}, Status: ${finalStatus}, Error: ${messageOf(err)}`
		)
		// Unexpected failure after the claim. If the email already left, say so; otherwise free the
		// delivery so a re-trigger can retry it instead of waiting out the lease.
		await finalizeDeliveryStep({
			periodKey,
			userId: user.id,
			status: finalStatus,
			outcomes,
			error: messageOf(err)
		})
		return { userId: user.id, status: finalStatus } as const
	}
}
