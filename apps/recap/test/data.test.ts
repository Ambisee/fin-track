import { describe, expect, it } from "vitest"
import {
	groupEntriesByLedger,
	partitionLedgers,
	sortByLedgerOrder,
	type EntryRow
} from "../src/domain/ledgers"
import type { LedgerOutcome, RecapUser } from "../src/domain/types"

const ledger = (id: string, name = id) => ({ id, name, currency: "USD" })
const user = (id: string, ledgers = [ledger("a")]): RecapUser => ({
	id,
	email: `${id}@x.io`,
	username: id,
	ledgers
})
const row = (id: string, ledgerId: string, date: string): EntryRow => ({
	id,
	ledgerId,
	category: "Rent",
	date,
	amount: 1,
	isPositive: false
})

describe("entries by ledger", () => {
	it("groups rows, sorts by date then id, and strips internals", () => {
		const grouped = groupEntriesByLedger([
			row("3", "l1", "2026-10-05"),
			row("1", "l2", "2026-10-01"),
			row("2", "l1", "2026-10-02"),
			row("0", "l1", "2026-10-02")
		])
		const l1 = grouped.find((g) => g.ledgerId === "l1")!
		expect(l1.entries.map((e) => e.date)).toEqual([
			"2026-10-02",
			"2026-10-02",
			"2026-10-05"
		])
		expect(Object.keys(l1.entries[0]).sort()).toEqual([
			"amount",
			"category",
			"date",
			"isPositive"
		])
		expect(grouped).toHaveLength(2)
	})
	it("filters out ledgers that have no entries in the retrieved data", () => {
		const fetched = groupEntriesByLedger([
			row("1", "a", "2026-10-01"),
			row("2", "zzz", "2026-10-01")
		])
		const { active, empty } = partitionLedgers(
			[ledger("a"), ledger("b"), ledger("c")],
			fetched
		)
		expect(active.map((x) => x.ledger.id)).toEqual(["a"])
		expect(empty.map((l) => l.id)).toEqual(["b", "c"]) // "zzz" belongs to nobody here and is ignored
	})
	it("keeps outcomes in the user's ledger order", () => {
		const ls = [ledger("a"), ledger("b"), ledger("c")]
		const outcomes: LedgerOutcome[] = [
			{ ledgerId: "c", ledgerName: "c", status: "empty" },
			{ ledgerId: "a", ledgerName: "a", status: "empty" },
			{ ledgerId: "b", ledgerName: "b", status: "empty" }
		]
		expect(sortByLedgerOrder(ls, outcomes).map((o) => o.ledgerId)).toEqual([
			"a",
			"b",
			"c"
		])
	})
})
