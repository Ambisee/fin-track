import { EntryViewOptions } from "@/components/user/TimeFilterControlPanel"
import { type ClassValue, clsx } from "clsx"
import { SetStateAction } from "react"
import { twMerge } from "tailwind-merge"
import { DateHelper, DateRange } from "./helper/DateHelper"

function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

function getUsernameFromEmail(email: string) {
	const atSymbol = email.indexOf("@")
	if (atSymbol === -1) {
		return ""
	}

	const username = email.slice(0, atSymbol)
	return username.replace(/[^a-zA-Z0-9]/g, "")
}

function isNonNullable<T>(value: T): value is NonNullable<T> {
	return value !== null && value !== undefined
}

function isSetStateFunction<T>(
	value: SetStateAction<T>
): value is (prev: T) => T {
	return typeof value === "function"
}

/**
 * Find a pair of indicies `x` and `y` where for index `x <= i <= y`,
 * - `comparator(lowerBound, data[i]) == true`
 * - `comparator(data[i], upperBound) == true`
 *
 * @param data The sorted dataset to search through.
 * @param lowerBound The lower bound element.
 * @param upperBound The upper bound element.
 * @param comparator This should return `true` if `a` should come before `b`.
 */
function findBoundIndicies<T>(
	data: T[],
	lowerBound: T,
	upperBound: T,
	comparator: (a: T, b: T) => boolean
): [number, number] {
	const answer: [number, number] = [NaN, NaN]

	let target = NaN
	let l = 0
	let r = data.length - 1
	while (l <= r) {
		const mid = l + Math.floor((r - l) / 2)
		if (comparator(lowerBound, data[mid])) {
			target = mid
			r = mid - 1
		} else {
			l = mid + 1
		}
	}

	if (isNaN(target)) return [NaN, NaN]
	answer[0] = target

	target = NaN
	l = answer[0]
	r = data.length - 1
	while (l <= r) {
		const mid = l + Math.floor((r - l) / 2)
		if (comparator(data[mid], upperBound)) {
			target = mid
			l = mid + 1
		} else {
			r = mid - 1
		}
	}

	if (isNaN(target)) return [NaN, NaN]
	answer[1] = target

	return answer
}

function getMonthSpansForDateRange(dateRange: DateRange) {
	if (!isNonNullable(dateRange?.to) || !isNonNullable(dateRange?.from))
		return []

	const from = new Date(dateRange?.from)
	const to = new Date(dateRange?.to)

	from.setDate(1)
	const result = []

	while (
		from.getMonth() <= to.getMonth() &&
		from.getFullYear() <= to.getFullYear()
	) {
		const monthStartEnd = DateHelper.getMonthStartEnd(from)
		result.push(monthStartEnd)
		from.setMonth(from.getMonth() + 1)
	}

	return result
}

function getDateRangeFromViewOptions(
	today: Date = new Date(),
	displaySettings: EntryViewOptions
) {
	let dateRange: DateRange
	switch (displaySettings.period.type) {
		case "TODAY":
			dateRange = DateHelper.getDateStartEnd(today)
			break
		case "YESTERDAY":
			dateRange = DateHelper.getYesterdayStartEnd(today)
			break
		case "LAST_7_DAYS":
			dateRange = DateHelper.getLast7DaysStartEnd(today)
			break
		default:
			dateRange = displaySettings.period.timeRange ?? { from: today, to: today }
			break
	}

	return dateRange
}

export {
	cn,
	findBoundIndicies,
	getDateRangeFromViewOptions,
	getMonthSpansForDateRange,
	getUsernameFromEmail,
	isNonNullable,
	isSetStateFunction
}
