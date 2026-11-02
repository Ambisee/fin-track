import { createHash, timingSafeEqual } from "node:crypto"
import { Hono } from "hono"
import { start } from "workflow/api"
import { loadConfig } from "./config"
import {
	isFinished,
	parsePeriodKey,
	previousMonthKey
} from "./domain/period"
import { monthEndRecapInitWorkflow } from "./workflows/init.workflow"

const app = new Hono()

const digest = (s: string) => createHash("sha256").update(s).digest()

/** Constant-time check of the `Authorization: Bearer <CRON_SECRET>` header Vercel Cron sends. */
const isAuthorized = (header: string | undefined, secret: string) =>
	timingSafeEqual(digest(header ?? ""), digest(`Bearer ${secret}`))

/**
 * The only endpoint. Vercel Cron calls it with GET; it just starts the (durable) init workflow and
 * returns, so the cron request is never held open and a crash here loses nothing.
 *
 * `?period=YYYY-MM` reruns a specific finished month. It is safe by construction: the delivery log
 * dedupes per (period, user), so a rerun only completes what is not already sent.
 */
app.get("/api/cron/month-end-recap", async (c) => {
	const config = loadConfig() // fails closed if CRON_SECRET is missing
	if (!isAuthorized(c.req.header("authorization"), config.cronSecret)) {
		return c.json({ error: "unauthorized" }, 401)
	}

	const now = new Date()
	const requested = c.req.query("period")
	let periodKey: string
	try {
		periodKey = requested ? parsePeriodKey(requested).key : previousMonthKey(now, config.timeZone)
	} catch (e) {
		return c.json({ error: e instanceof Error ? e.message : "invalid period" }, 400)
	}
	if (!isFinished(periodKey, now, config.timeZone)) {
		return c.json({ error: `period ${periodKey} has not finished yet` }, 400)
	}

	const run = await start(monthEndRecapInitWorkflow, [periodKey])
	return c.json({ status: "started", period: periodKey, runId: run.runId }, 202)
})

export default app
