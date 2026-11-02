import type { Period } from "./types"

const KEY_RE = /^(\d{4})-(0[1-9]|1[0-2])$/

export function parsePeriodKey(key: string): Period {
	const m = KEY_RE.exec(key)
	if (!m) throw new Error(`Invalid period "${key}", expected YYYY-MM`)
	const year = Number(m[1])
	const month = Number(m[2])
	// Day 0 of the next month is the last day of this one.
	const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate()
	return {
		key,
		from: `${m[1]}-${m[2]}-01`,
		to: `${m[1]}-${m[2]}-${String(lastDay).padStart(2, "0")}`
	}
}

/** The calendar month `now` falls in, as seen in `timeZone`. Throws RangeError for an unknown zone. */
export function currentMonthKey(now: Date, timeZone: string): string {
	const parts = new Intl.DateTimeFormat("en-US", {
		timeZone,
		year: "numeric",
		month: "2-digit"
	}).formatToParts(now)
	const get = (t: string) => parts.find((p) => p.type === t)!.value
	return `${get("year")}-${get("month")}`
}

export function previousMonthKey(now: Date, timeZone: string): string {
	const [y, m] = currentMonthKey(now, timeZone).split("-").map(Number)
	const prev = new Date(Date.UTC(y, m - 2, 1)) // JS months are 0-based, so m - 2 is "last month"
	return `${prev.getUTCFullYear()}-${String(prev.getUTCMonth() + 1).padStart(2, "0")}`
}

export const previousMonthPeriod = (now: Date, timeZone = "UTC"): Period =>
	parsePeriodKey(previousMonthKey(now, timeZone))

/** A period may only be recapped once it is over in `timeZone`. */
export const isFinished = (periodKey: string, now: Date, timeZone: string) =>
	periodKey < currentMonthKey(now, timeZone)
