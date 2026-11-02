/**
 * ASSUMED FinTrack schema for entries. Users and ledgers no longer come from the database: they come from the
 * existing users API. This is the only file that names the entries table and columns; adjust it to reality.
 */
export const SCHEMA = {
	entries: {
		table: "entry",
		id: "id",
		ledgerId: "ledger",
		category: "category",
		date: "date",
		amount: "amount",
		isPositive: "is_positive"
	}
} as const
