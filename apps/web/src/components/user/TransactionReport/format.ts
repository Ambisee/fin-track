import type {
	AmountFormatter,
	CategoryStat,
	DateFormatter,
	Entry
} from "./types"

const DEFAULT_LOCALE = "en-US"

/**
 * Creates a formatter that renders amounts as plain numbers with 2 decimals, e.g. "1,234.56"
 * (en-US) or "1.234,56" (de-DE). Always formats the absolute value; no currency symbol.
 * Falls back to DEFAULT_LOCALE if the locale tag is invalid.
 */
export function createAmountFormatter(locale?: string): AmountFormatter {
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

export function createDateFormatter(locale?: string): DateFormatter {
	const options: Intl.DateTimeFormatOptions = { dateStyle: "medium" }
	let dtf: Intl.DateTimeFormat
	try {
		dtf = new Intl.DateTimeFormat(locale, options)
	} catch {
		dtf = new Intl.DateTimeFormat(DEFAULT_LOCALE, options)
	}

	return (date) => dtf.format(typeof date === "string" ? new Date(date) : date)
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

/**
 * Groups the entries of one column (credit or debit) by category.
 * Sorted by total, largest first, so the chart slices and table rows share the same order.
 */
export function summarizeByCategory(
	entries: Entry[],
	column: "credit" | "debit"
): CategoryStat[] {
	const groups = new Map<string, { count: number; total: number }>()
	let sideTotal = 0
	for (const e of entries) {
		if (columnOf(e) !== column) continue
		const amount = Math.abs(e.amount)
		const g = groups.get(e.category) ?? { count: 0, total: 0 }
		g.count += 1
		g.total += amount
		groups.set(e.category, g)
		sideTotal += amount
	}
	return [...groups.entries()]
		.map(([category, g]) => ({
			category,
			count: g.count,
			total: g.total,
			share: sideTotal > 0 ? g.total / sideTotal : 0
		}))
		.sort((a, b) => b.total - a.total || a.category.localeCompare(b.category))
}

/** 0.462 -> "46.2%" */
export const formatPercent = (share: number) => `${(share * 100).toFixed(1)}%`
