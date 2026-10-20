import {
	TransactionReportDocument,
	type ReportDocumentProps
} from "@fintrack/transaction-report"
import type { DateRange, EntryRow } from "@fintrack/types"
import React from "react"
import * as ReactPDF from "@react-pdf/renderer"
import type { LedgerDetails, UserProfile } from "./dataFetcher"

export interface ReportInfoParams {
	user: UserProfile
	ledger: LedgerDetails
	entries: EntryRow[]
	period: DateRange
	locale?: string
	title?: string
}

export interface ReportGenerationService {
	generate: (params: ReportInfoParams) => Promise<Buffer>
}

export class ReportGenerationServiceImpl implements ReportGenerationService {
	async generate(params: ReportInfoParams): Promise<Buffer> {
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
			title: params.title || "FinTrack Report",
			locale: locale,
			generatedAt: new Date()
		}

		const docElement = React.createElement(
			TransactionReportDocument,
			reportProps
		)
		const pdfBuffer = await ReactPDF.renderToBuffer(docElement as any)

		return Buffer.from(pdfBuffer)
	}
}
