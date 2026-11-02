import { CurrencyRow, Database } from "@fintrack/types"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Source } from "../../domain/ports"
import type { LedgerEntries, Period, RecapUser } from "../../domain/types"
import { fail } from "assert"

/** Rows per batch. PostgREST caps a response at 1000 rows by default, so this must not exceed that. */
const BATCH_SIZE = 1000

export class SupabaseSource implements Source {
	constructor(private readonly db: SupabaseClient<Database>) {}

	async fetchOptedInUserDataList(): Promise<RecapUser[]> {
		const { data, error } = await this.db.rpc(
			"get_opt_in_monthly_recap_users_and_ledgers"
		)

		if (error !== null) fail("fetchOptedInUserDataList")
		if (data === null) fail("fetchOptedInUserDataList")

		return data.map(
			(v) =>
				({
					id: v.uid,
					email: v.email,
					username: v.username,
					ledgers: v.ledgers.map((l) => ({
						id: String(l.id),
						name: l.name as string,
						currency: (l.currency as { name: string }).name
					}))
				}) satisfies RecapUser
		)
	}

	async fetchLedgerEntries(
		ledgerIds: string[],
		period: Period,
		cutoffIso: string
	): Promise<LedgerEntries[]> {
		const { data, error } = await this.db.rpc("get_ledgers_with_entries", {
			p_ledger_ids: ledgerIds.map(Number),
			p_start_date: period.from,
			p_end_date: period.to
		})

		if (error !== null) fail("fetchLedgerEntries")
		if (data === null) fail("fetchLedgerEntries")

		return data.map((v) => ({
			ledgerId: String(v.ledger_id),
			entries: v.entries.map((e) => ({
				amount: e.amount,
				category: e.category,
				date: e.date,
				isPositive: e.is_positive
			}))
		}))
	}
}
