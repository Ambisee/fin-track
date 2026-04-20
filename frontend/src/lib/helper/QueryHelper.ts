import { ENTRY_QKEY, STATISTICS_QKEY } from "../constants"
import { DateRange } from "./DateHelper"

class QueryHelper {
	static readonly MESSAGE_NO_USER = "No user data found."
	static readonly MESSAGE_NO_SETTINGS = "No settings data found."
	static readonly MESSAGE_NO_LEDGER = "No ledger provided."
	static readonly MESSAGE_EMPTY_LEDGER_NAME = "Ledger names must not be empty."
	static readonly MESSAGE_EMPTY_CATEGORY_NAME =
		"Category names must not be empty."
	static readonly MESSAGE_REQUIRE_AT_LEAST_ONE_LEDGER =
		"User must have at least one ledger."

	static getEntryQueryKey(ledger: number | undefined, dateRange: DateRange) {
		return [...ENTRY_QKEY, ledger, dateRange] as const
	}

	static getStatisticQueryKey(ledger?: number, period?: Date) {
		return [
			...STATISTICS_QKEY,
			`${ledger}`,
			`${period?.getMonth()}-${period?.getFullYear()}`
		] as const
	}
}

export { QueryHelper }
