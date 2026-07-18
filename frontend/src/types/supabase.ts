import { useMonthGroupQuery } from "@/lib/queries"
import { DefinedQueryObserverResult } from "@tanstack/react-query"
import { Database } from "./supabase-auto"

type InferQueryType<T> =
	T extends DefinedQueryObserverResult<infer U>
		? U extends Array<infer V>
			? V
			: U
		: never

type EntityNames = keyof Database["public"]["Tables"]
type Entity<T extends EntityNames> = Database["public"]["Tables"][T]["Row"]

type Statistic =
	Database["public"]["Functions"]["calculate_statistics"]["Returns"] extends (infer U)[]
		? U
		: never

type Entry = Entity<"entry">
type Category = Entity<"category">
type Ledger = Entity<"ledger">
type Currency = Entity<"currency">
type MonthGroup = InferQueryType<ReturnType<typeof useMonthGroupQuery>>
type UserSettings = Entity<"settings">
type EntryDataCursor =
	| {
			index: number
			id: number
			category: string
			date: string
	  }
	| undefined

export {
	type Category,
	type Currency,
	type Database,
	type Entry,
	type EntryDataCursor,
	type Ledger,
	type MonthGroup,
	type Statistic,
	type UserSettings
}
