import {
	useCategoriesQuery,
	useCurrenciesQuery,
	useEntryDataQuery,
	useLedgersQuery,
	useStatisticsQuery
} from "@/lib/hooks"
import { PostgrestSingleResponse } from "@supabase/supabase-js"
import { DefinedQueryObserverResult } from "@tanstack/react-query"
import { Database } from "./supabase-auto"

type InferQueryType<T> = T extends DefinedQueryObserverResult<infer U> ? 
    (U extends Array<infer V> ? V : U) : 
    never

type Entry = InferQueryType<ReturnType<typeof useEntryDataQuery>>
type Statistic = InferQueryType<ReturnType<typeof useStatisticsQuery>>
type Category = InferQueryType<ReturnType<typeof useCategoriesQuery>>
type Ledger = InferQueryType<ReturnType<typeof useLedgersQuery>>
type Currency = InferQueryType<ReturnType<typeof useCurrenciesQuery>>
type UserSettings = Database["public"]["Tables"]["settings"]["Row"]
type EntryDataCursor = {
    index: number
    id: number
    category: string
    date: string
} | undefined

export {
	type Category,
	type Currency,
	type Database,
	type Entry,
	type Ledger,
	type Statistic,
	type UserSettings,
    
    type EntryDataCursor
}
