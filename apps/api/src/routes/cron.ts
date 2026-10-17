import { Hono } from "hono"
import { cronAuthMiddleware } from "../middleware/cronAuth"
import { generateReportPdf } from "../services/pdf"
import { DataFetcher, UserProfile } from "../services/supabase"
import { DummyMailerService, GmailMailerService } from "../services/mailer"
import { type DateRange } from "@fintrack/types"

export const cronRouter = new Hono()

cronRouter.use("*", cronAuthMiddleware)

const mailerEmail = process.env.MAILER_EMAIL
const mailerPassword = process.env.MAILER_PASSWORD
const mailerService =
	mailerEmail !== undefined && mailerPassword !== undefined
		? new GmailMailerService(mailerEmail, mailerPassword)
		: new DummyMailerService()

if (mailerService instanceof DummyMailerService) {
	console.log(
		"Missing `mailerEmail` or `mailerPassword` values, revert to use DummyMailerService instance."
	)
}

const MONTH_NAMES = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December"
]

function getTargetMonthlyPeriod() {
	const now = new Date()
	// If run on the 1st day of month (or <= 5th), target the previous month
	// Otherwise, target the current month
	let targetYear = now.getFullYear()
	let targetMonth = now.getMonth() // 0-indexed: 0 = January

	if (now.getDate() <= 5) {
		targetMonth -= 1
		if (targetMonth < 0) {
			targetMonth = 11
			targetYear -= 1
		}
	}

	const from = new Date(targetYear, targetMonth, 1)
	// Last day of month
	const to = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999)
	const periodName = `${MONTH_NAMES[targetMonth]} ${targetYear}`

	return { from, to, periodName }
}

async function handleSingleUserMonthlyReport(
	periodName: string,
	dateRange: DateRange,
	user: UserProfile
) {
	const { from, to } = dateRange
	if (from === undefined || to === undefined) {
		throw Error("Invalid time range.")
	}

	if (!user.current_ledger) {
		console.log(
			`[Cron] Skipping user ${user.username} (${user.id}): No current ledger selected.`
		)
		throw Error("No ledger selected.")
	}

	const ledger = await DataFetcher.getLedger(user.id, user.current_ledger)
	if (!ledger) {
		console.log(
			`[Cron] Skipping user ${user.username}: Ledger ${user.current_ledger} not found.`
		)
		throw Error(`Ledger ${user.current_ledger} not found.`)
	}

	const entries = await DataFetcher.getEntriesForPeriod(
		user.id,
		ledger.id,
		from,
		to
	)

	if (entries.length < 1) {
		console.log(
			`[Cron] User ${user.username} has 0 transactions in ${periodName}. Skipping.`
		)
		return
	}

	const pdfBuffer = await generateReportPdf({
		user,
		ledger,
		entries,
		period: { from, to },
		title: "MONTHLY FINANCIAL REPORT"
	})

	await mailerService.sendMonthlyReportEmail({
		to: user.email,
		username: user.username,
		ledgerName: ledger.name,
		periodName,
		pdfBuffer
	})
}

async function handleMonthlyReports(c: any) {
	const { from, to, periodName } = getTargetMonthlyPeriod()

	const eligibleUsers = await DataFetcher.getUsersWithReportEnabled()
	console.log(
		`[Cron] Found ${eligibleUsers.length} users with automatic monthly report enabled for ${periodName}.`
	)

	const sendEmailPromiseList = []

	for (const user of eligibleUsers) {
		sendEmailPromiseList.push(
			handleSingleUserMonthlyReport(periodName, { from, to }, user)
				.then((v) => {
					console.log(
						`[Cron] Successfully delivered monthly report to ${user.email} (${user.username}).`
					)
				})
				.catch((err) => {
					console.error(
						`[Cron] Error processing monthly report for user ${user.username}:`,
						err
					)
				})
		)
	}

	const settledPromises = await Promise.allSettled(sendEmailPromiseList)
	const successCount = settledPromises.reduce(
		(acc, v) => acc + (v.status === "fulfilled" ? 1 : 0),
		0
	)

	return c.json({
		data: {
			period: periodName,
			users: {
				count: eligibleUsers.length,
				sent: successCount
			}
		}
	})
}

// Support both POST and GET (Vercel Cron triggers GET by default)
cronRouter.post("/monthly-reports", handleMonthlyReports)
cronRouter.get("/monthly-reports", handleMonthlyReports)
