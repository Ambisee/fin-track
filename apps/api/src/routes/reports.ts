import { Hono } from "hono"
import { authMiddleware } from "../middleware/auth"
import { generateReportSchema } from "../schemas/report"
import {
	SupabaseDataFetcherService,
	type DataFetcherService
} from "../services/dataFetcher"
import {
	ReportGenerationServiceImpl,
	type ReportGenerationService
} from "../services/pdf"

export const reportsRouter = new Hono()

reportsRouter.use("*", authMiddleware)

const reportGenerationService: ReportGenerationService =
	new ReportGenerationServiceImpl()
const dataFetcherService: DataFetcherService = new SupabaseDataFetcherService()

/**
 * POST /api/reports/generate
 * Generates a financial report PDF for the authenticated user and given ledger & time range.
 *
 * Query Parameters:
 * @query `ledger-id` (int): the ledger ID of the entries to be retrieved
 * @query `from` (string): The beginning of the date range, inclusive. Only records dated on or after this value are returned. Format: YYYY-MM-DD (ISO 8601), e.g. 2026-01-01.
 * @query `to` (string): The end of the date range, inclusive. Only records dated on or before this value are returned. Format: YYYY-MM-DD, e.g. 2026-01-31.
 * @query `locale` (string, optional): The locale used to format the document
 */
reportsRouter.get("/generate", async (c) => {
	const user = c.get("user")

	const body = {
		ledger_id: c.req.query("ledger-id"),
		time_range: {
			from: c.req.query("from"),
			to: c.req.query("to")
		},
		locale: c.req.query("locale")
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
	const profile = await dataFetcherService.getUser(user.id)
	if (!profile) {
		return c.json({ error: "Unable to retrieve user information." }, 400)
	}

	// 2. Fetch ledger ensuring it belongs to the user
	const ledger = await dataFetcherService.getLedger(user.id, ledger_id)
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
	const entries = await dataFetcherService.getEntriesForPeriod(
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
		const pdfBuffer = await reportGenerationService.generate({
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
				"Content-Disposition": 'attachment; filename="report.pdf"',
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
