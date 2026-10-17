import type { Database } from "./supabase-auto"

export type { Database } from "./supabase-auto"
export type { Json } from "./supabase-auto"

export type EntityNames = keyof Database["public"]["Tables"]
export type Entity<T extends EntityNames> =
	Database["public"]["Tables"][T]["Row"]
export type EntityInsert<T extends EntityNames> =
	Database["public"]["Tables"][T]["Insert"]
export type EntityUpdate<T extends EntityNames> =
	Database["public"]["Tables"][T]["Update"]

export type EntryRow = Entity<"entry">
export type CategoryRow = Entity<"category">
export type CurrencyRow = Entity<"currency">
export type SettingsRow = Entity<"settings">
export type LedgerRow = Entity<"ledger">

export interface LedgerWithCurrency extends LedgerRow {
	currency: CurrencyRow | null
}

export type Statistic =
	Database["public"]["Functions"]["calculate_statistics"]["Returns"] extends (infer U)[]
		? U
		: never

export interface DateRange {
	from?: Date
	to?: Date
}
