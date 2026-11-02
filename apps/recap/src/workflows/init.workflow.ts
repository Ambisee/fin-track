import { sleep } from "workflow"
import { start } from "workflow/api"
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

	const { cutoffIso } = await ensurePeriodStep(periodKey)
	const users = await fetchRecipientsStep()

	const chunks = chunked(users, USER_START_CHUNK_SIZE)
	for (const [i, chunk] of chunks.entries()) {
		await Promise.all(chunk.map((user) => start(userRecapWorkflow, [user, periodKey, cutoffIso])))
		// Throttle the senders (Gmail), but never sleep after the last burst.
		if (i < chunks.length - 1) await sleep(USER_START_CHUNK_DELAY)
	}
	return { periodKey, started: users.length }
}
