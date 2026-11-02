import type { SupabaseClient } from "@supabase/supabase-js"
import type { ClaimResult, RecapLog } from "../../domain/ports"
import { Database, Json } from "../supabase-auto"

export class SupabaseRecapLog implements RecapLog {
	constructor(private readonly db: SupabaseClient<Database>) {}

	async ensurePeriod(periodKey: string) {
		// ON CONFLICT DO NOTHING: the first caller's DB-assigned `cutoff` (default now()) is the snapshot forever.
		const up = await this.db
			.from("recap_periods")
			.upsert(
				{ period_key: periodKey },
				{ onConflict: "period_key", ignoreDuplicates: true }
			)
		if (up.error)
			throw new Error(
				`Supabase: ensurePeriod insert failed: ${up.error.message}`
			)

		const { data, error } = await this.db
			.from("recap_periods")
			.select("cutoff")
			.eq("period_key", periodKey)
			.single()
		if (error)
			throw new Error(`Supabase: ensurePeriod read failed: ${error.message}`)
		return { cutoffIso: new Date(data.cutoff as string).toISOString() }
	}

	async claimDelivery(periodKey: string, userId: string, leaseSeconds: number) {
		const { data, error } = await this.db.rpc("recap_claim_delivery", {
			p_period_key: periodKey,
			p_user_id: userId,
			p_lease_seconds: leaseSeconds
		})
		if (error)
			throw new Error(`Supabase: claimDelivery failed: ${error.message}`)
		return data as ClaimResult
	}

	async completeDelivery(
		periodKey: string,
		userId: string,
		result: Parameters<RecapLog["completeDelivery"]>[2]
	) {
		const { error } = await this.db
			.from("recap_deliveries")
			.update({
				status: result.status,
				ledger_outcomes: result.outcomes as unknown as Json[],
				error: result.error ?? null,
				lease_expires_at: null,
				sent_at: result.status === "sent" ? new Date().toISOString() : null,
				updated_at: new Date().toISOString()
			})
			.eq("period_key", periodKey)
			.eq("user_id", userId)
		if (error)
			throw new Error(`Supabase: completeDelivery failed: ${error.message}`)
	}
}
