import { sleep } from "workflow"
import { start } from "workflow/api"
import { logger } from "../logger"
import { ensurePeriodStep, fetchRecipientsStep } from "../steps/recap.steps"
import { USER_START_CHUNK_DELAY, USER_START_CHUNK_SIZE } from "./policy"
import { userRecapWorkflow } from "./user.workflow"

const chunked = <T>(items: T[], size: number): T[][] =>
	Array.from({ length: Math.ceil(items.length / size) }, (_, i) =>
		items.slice(i * size, (i + 1) * size)
	)

/**
 * WFInit
 *   1. fix the period's snapshot cutoff (DB; a duplicate trigger gets the same value back)
 *   2. fetch all opted-in users + their ledgers with ONE call to the existing API
 *   3. start one WFUser per user, handing it the whole user record, then finish (it does not wait for them)
 */
export async function monthEndRecapInitWorkflow(periodKey: string) {
	"use workflow"

	logger.info(
		"monthEndRecapInitWorkflow",
		`Workflow start - Period: ${periodKey}`
	)

	const { cutoffIso } = await ensurePeriodStep(periodKey)
	logger.debug(
		"monthEndRecapInitWorkflow",
		`Period: ${periodKey}, Snapshot cutoff established: ${cutoffIso}`
	)

	const users = await fetchRecipientsStep()
	logger.info(
		"monthEndRecapInitWorkflow",
		`Period: ${periodKey}, Total opted-in recipients discovered: ${users.length}`
	)

	const chunks = chunked(users, USER_START_CHUNK_SIZE)
	for (const [i, chunk] of chunks.entries()) {
		logger.debug(
			"monthEndRecapInitWorkflow",
			`Period: ${periodKey}, Launching chunk ${i + 1}/${chunks.length} (${chunk.length} users)`
		)
		await Promise.all(
			chunk.map((user) =>
				start(userRecapWorkflow, [user, periodKey, cutoffIso])
			)
		)
		// Throttle the senders (Gmail), but never sleep after the last burst.
		if (i < chunks.length - 1) await sleep(USER_START_CHUNK_DELAY)
	}

	logger.info(
		"monthEndRecapInitWorkflow",
		`Workflow end - Period: ${periodKey}, Status: completed, Dispatched: ${users.length} user workflows`
	)
	return { periodKey, started: users.length }
}
