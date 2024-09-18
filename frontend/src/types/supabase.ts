import { PostgrestSingleResponse, QueryData } from "@supabase/supabase-js"
import { Database } from "./supabase-auto"
import { useCategoriesQuery, useEntryDataQuery } from "@/lib/hooks"
import { DefinedQueryObserverResult } from "@tanstack/react-query"


type InferQueryType<T> = T extends DefinedQueryObserverResult<PostgrestSingleResponse<infer U>> ? 
    (U extends Array<infer V> ? V : never) : 
    never

type Entry = InferQueryType<ReturnType<typeof useEntryDataQuery>>
type Category = InferQueryType<ReturnType<typeof useCategoriesQuery>>
type UserSettings = Database["public"]["Tables"]["settings"]["Row"]

export {
    type Database,
    type Entry,
    type Category,
    type UserSettings,
}