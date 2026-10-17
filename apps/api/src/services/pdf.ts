import {
	TransactionReportDocument,
	ReportDocumentProps
} from "@fintrack/transaction-report"
import type { DateRange, EntryRow } from "@fintrack/types"
import React from "react"
import ReactPDF from "@react-pdf/renderer"
import type { LedgerDetails, UserProfile } from "./supabase"

export async function generateReportPdf(params: {
	user: UserProfile
	ledger: LedgerDetails
	entries: EntryRow[]
	period: DateRange
	locale?: string
	title?: string
}): Promise<Buffer> {
	const locale = params.locale || "en-US"

	const reportProps: ReportDocumentProps = {
		info: {
			username: params.user.username,
			ledger: params.ledger.name,
			locale: locale,
			period: params.period,
			currency: params.ledger.currency_name
		},
		entries: params.entries.map((entry) => ({
			category: entry.category,
			date: new Date(entry.date),
			amount: entry.amount,
			isPositive: entry.is_positive
		})),
		title: params.title || "FINANCIAL REPORT",
		locale: locale,
		generatedAt: new Date()
	}

	const docElement = React.createElement(TransactionReportDocument, reportProps)
	const pdfBuffer = await ReactPDF.renderToBuffer(docElement as any)

	return Buffer.from(pdfBuffer)
}
