import { Hono } from "hono"
import { authMiddleware } from "../middleware/auth"
import { generateReportSchema } from "../schemas/report"
import { DataFetcher } from "../services/supabase"
import { generateReportPdf } from "../services/pdf"

export const reportsRouter = new Hono()

reportsRouter.use("*", authMiddleware)

/**
 * POST /api/reports/generate
 * Generates a financial report PDF for the authenticated user and given ledger & time range.
 */
reportsRouter.post("/generate", async (c) => {
	const user = c.get("user")

	let body: unknown
	try {
		body = await c.req.json()
	} catch {
		return c.json({ error: "Invalid JSON in request body." }, 400)
	}

	const parseResult = generateReportSchema.safeParse(body)
	if (!parseResult.success) {
		return c.json(
			{
				error: "Validation failed",
				details: parseResult.error.flatten()
			},
			400
		)
	}

	const { ledger_id, time_range, locale } = parseResult.data

	// 1. Fetch user profile & settings
	const profile = await DataFetcher.getUser(user.id)
	if (!profile) {
		return c.json({ error: "Unable to retrieve user information." }, 400)
	}

	// 2. Fetch ledger ensuring it belongs to the user
	const ledger = await DataFetcher.getLedger(user.id, ledger_id)
	if (!ledger) {
		return c.json(
			{
				error:
					"Unable to retrieve the ledger. Please check that you have a valid ledger id and user id."
			},
			400
		)
	}

	// 3. Fetch transaction entries in date range
	const entries = await DataFetcher.getEntriesForPeriod(
		user.id,
		ledger.id,
		time_range.from,
		time_range.to
	)

	if (entries.length < 1) {
		return c.json(
			{
				error:
					"No transaction records available for the given period and ledger."
			},
			400
		)
	}

	// 4. Generate PDF report buffer
	try {
		const pdfBuffer = await generateReportPdf({
			user: profile,
			ledger,
			entries,
			period: {
				from: time_range.from,
				to: time_range.to
			},
			locale
		})

		const body = new Uint8Array(pdfBuffer.byteLength)
		body.set(pdfBuffer)

		return new Response(body, {
			status: 200,
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": 'inline; filename="report.pdf"',
				"Content-Length": pdfBuffer.length.toString()
			}
		})
	} catch (error: any) {
		console.error("PDF generation error:", error)
		return c.json(
			{ error: error?.message || "Failed to generate PDF document." },
			500
		)
	}
})
