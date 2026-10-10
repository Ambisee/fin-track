import type { AmountFormatter, Entry } from "./types"

const MONTHS = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec"
]

const pad2 = (n: number) => String(n).padStart(2, "0")

/** "01 Sep 2026". A `YYYY-MM-DD` string is read as a local date (no timezone shift). */
export function formatDate(value: Date | string): string {
	let d: Date
	if (typeof value === "string") {
		const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
		d = m
			? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
			: new Date(value)
	} else {
		d = value
	}
	return `${pad2(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export const DEFAULT_LOCALE = "en-US"

/**
 * Creates a formatter that renders amounts as plain numbers with 2 decimals, e.g. "1,234.56"
 * (en-US) or "1.234,56" (de-DE). Always formats the absolute value; no currency symbol.
 * Falls back to DEFAULT_LOCALE if the locale tag is invalid.
 */
export function createAmountFormatter(
	locale: string = DEFAULT_LOCALE
): AmountFormatter {
	const options = { minimumFractionDigits: 2, maximumFractionDigits: 2 }
	let nf: Intl.NumberFormat
	try {
		nf = new Intl.NumberFormat(locale, options)
	} catch {
		nf = new Intl.NumberFormat(DEFAULT_LOCALE, options)
	}
	// Some locales group digits with U+202F (narrow no-break space), which the built-in PDF fonts
	// cannot draw. Swap it for a regular no-break space (U+00A0), which Courier does support.
	return (amount) => nf.format(Math.abs(amount)).replace(/\u202F/g, "\u00A0")
}

/** "+1,234.56" / "-1,234.56" (ASCII hyphen; the true minus sign U+2212 is missing from the standard PDF fonts). */
export const formatSignedAmount = (
	value: number,
	formatAmount: AmountFormatter
) => `${value >= 0 ? "+" : "-"}${formatAmount(value)}`

/** "001", "002", … */
export const formatRowNumber = (index: number) =>
	String(index + 1).padStart(3, "0")

/** Column rule: isPositive true -> credit, false -> debit. */
export const columnOf = (entry: Entry): "credit" | "debit" =>
	entry.isPositive ? "credit" : "debit"

export function summarize(entries: Entry[]) {
	let totalCredit = 0
	let totalDebit = 0
	for (const e of entries) {
		if (columnOf(e) === "credit") totalCredit += Math.abs(e.amount)
		else totalDebit += Math.abs(e.amount)
	}
	return { totalCredit, totalDebit, net: totalCredit - totalDebit }
}
