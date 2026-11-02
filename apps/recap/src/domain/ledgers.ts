import type {
	LedgerEntries,
	LedgerInfo,
	LedgerOutcome,
	ReportEntry
} from "./types"

/** One entry as read from storage; `id` only drives pagination and tie-breaking. */
export interface EntryRow extends ReportEntry {
	id: string | number
	ledgerId: string
}

const byDateThenId = (a: EntryRow, b: EntryRow) =>
	a.date < b.date ? -1 : a.date > b.date ? 1 : String(a.id).localeCompare(String(b.id))

/** Groups a flat, possibly unordered batch result by ledger. Ledgers with no rows simply do not appear. */
export function groupEntriesByLedger(rows: EntryRow[]): LedgerEntries[] {
	const byLedger = new Map<string, EntryRow[]>()
	for (const row of rows) {
		const list = byLedger.get(row.ledgerId)
		if (list) list.push(row)
		else byLedger.set(row.ledgerId, [row])
	}
	return [...byLedger.entries()].map(([ledgerId, list]) => ({
		ledgerId,
		entries: list
			.sort(byDateThenId)
			.map(({ category, date, amount, isPositive }) => ({ category, date, amount, isPositive }))
	}))
}

export interface LedgerWithEntries {
	ledger: LedgerInfo
	entries: ReportEntry[]
}

/**
 * Splits the user's ledgers into those that have entries in the retrieved data (reports are generated
 * for these) and those that do not (skipped). Rows for ledgers the user did not opt in are ignored.
 */
export function partitionLedgers(
	ledgers: LedgerInfo[],
	fetched: LedgerEntries[]
): { active: LedgerWithEntries[]; empty: LedgerInfo[] } {
	const byLedger = new Map(fetched.map((f) => [f.ledgerId, f.entries]))
	const active: LedgerWithEntries[] = []
	const empty: LedgerInfo[] = []
	for (const ledger of ledgers) {
		const entries = byLedger.get(ledger.id)
		if (entries && entries.length > 0) active.push({ ledger, entries })
		else empty.push(ledger)
	}
	return { active, empty }
}

/** Keeps outcomes in the order the user's ledgers were listed, so emails and attachments read predictably. */
export function sortByLedgerOrder(
	ledgers: LedgerInfo[],
	outcomes: LedgerOutcome[]
): LedgerOutcome[] {
	const rank = new Map(ledgers.map((l, i) => [l.id, i]))
	return [...outcomes].sort(
		(a, b) => (rank.get(a.ledgerId) ?? 0) - (rank.get(b.ledgerId) ?? 0)
	)
}
