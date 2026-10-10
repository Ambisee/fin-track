import { DateRange } from "@/lib/helper/DateHelper"

/** Document identity shown at the top of page 1. */
export interface DocumentInfo {
	username: string
	ledger: string
	/** Free-form text, e.g. "01 Sep 2026 - 30 Sep 2026". */
	period: DateRange
}

/** A single transaction row. The row number is generated automatically from its position in the array. */
export interface Entry {
	category: string
	/** A `Date`, a `YYYY-MM-DD` string, or any string that `new Date()` can parse. */
	date: Date | string
	/** Amount. The sign (+/-) is ignored; the absolute value is used. */
	amount: number
	/**
	 * true  -> amount goes in the CREDIT column
	 * false -> amount goes in the DEBIT column
	 */
	isPositive: boolean
}

export interface ReportDocumentProps {
	info: DocumentInfo
	entries: Entry[]
	/** Title at the top of page 1. Default: "FINANCIAL REPORT". */
	title?: string
	/** Document generation date shown in the footer. Default: today. */
	generatedAt?: Date
}
