import type { Entry } from "./types"

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

/** "$1,234.56" – always the absolute value. */
export function formatMoney(value: number): string {
	const [int, dec] = Math.abs(value).toFixed(2).split(".")
	return `$${int.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${dec}`
}

/** "+$1,234.56" / "-$1,234.56" (hyphen ASCII; the true minus sign U+2212 is missing from the standard PDF fonts). */
export function formatSignedMoney(value: number): string {
	return `${value >= 0 ? "+" : "-"}${formatMoney(value)}`
}

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
