import { EntryFormData } from "@/components/user/EntryForm/EntryForm"
import { Category, Ledger } from "@/types/supabase"
import { PostgrestError } from "@supabase/supabase-js"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { CATEGORIES_QKEY, LEDGER_QKEY, USER_SETTINGS_QKEY } from "./constants"
import { DateHelper } from "./helper/DateHelper"
import { QueryHelper } from "./helper/QueryHelper"
import { supabaseClient } from "./supabase"
import { isNonNullable } from "./utils"
import { useUserQuery } from "./queries"
import { useLedgersQuery } from "./queries"

function useInsertEntryMutation() {
	const [supabase] = useState(supabaseClient())
	const userQuery = useUserQuery()

	return useMutation({
		mutationFn: async (entry: EntryFormData) => {
			const user = userQuery.data
			if (!user) {
				throw Error(QueryHelper.MESSAGE_NO_USER)
			}

			const isPositive = entry.type === "Income"
			let note: string | null = entry.note
			if (note.length === 0) {
				note = null
			}

			const { data, error } = await supabase
				.from("entry")
				.insert({
					date: DateHelper.toDatabaseString(entry.date),
					category: entry.category,
					created_by: user.id,
					is_positive: isPositive,
					amount: Number(entry.amount),
					note: note,
					ledger: entry.ledger
				})
				.select()
				.single()

			if (error !== null) {
				throw new PostgrestError(error)
			}

			return data
		}
	})
}

function useDeleteEntryMutation() {
	const [supabase] = useState(supabaseClient())
	const userQuery = useUserQuery()

	return useMutation({
		mutationFn: async (id: number) => {
			const user = userQuery.data
			if (!user) {
				throw Error(QueryHelper.MESSAGE_NO_USER)
			}

			const { data, error } = await supabase
				.from("entry")
				.delete()
				.eq("created_by", user.id)
				.eq("id", id)
				.select("*")
				.single()

			if (error !== null) {
				throw new PostgrestError(error)
			}

			return data
		}
	})
}

function useUpdateEntryMutation() {
	const [supabase] = useState(supabaseClient())
	return useMutation({
		mutationFn: async (entry: EntryFormData & { id: number }) => {
			const isPositive = entry.type === "Income"

			let note: string | null = entry.note
			if (note.length === 0) {
				note = null
			}

			const { data, error } = await supabase
				.from("entry")
				.update({
					date: DateHelper.toDatabaseString(entry.date),
					category: entry.category,
					is_positive: isPositive,
					amount: Number(entry.amount),
					note: note,
					ledger: entry.ledger
				})
				.eq("id", entry.id)
				.select()
				.single()

			if (error !== null) {
				throw new PostgrestError(error)
			}

			return data
		}
	})
}

function useInsertLedgerMutation() {
	const [supabase] = useState(supabaseClient())
	const userQuery = useUserQuery()

	return useMutation({
		mutationKey: LEDGER_QKEY,
		mutationFn: async (
			ledger: Pick<Ledger, "created_by" | "name" | "currency_id">
		) => {
			const user = userQuery.data
			if (!isNonNullable(user)) {
				throw Error(QueryHelper.MESSAGE_NO_USER)
			}

			if (ledger.name.length === 0) {
				throw Error(QueryHelper.MESSAGE_EMPTY_LEDGER_NAME)
			}

			const { data, error } = await supabase
				.from("ledger")
				.insert({
					created_by: user.id,
					name: ledger.name,
					currency_id: ledger.currency_id
				})
				.select("*, currency (currency_name), entry(count)")
				.single()

			if (error !== null) {
				throw new PostgrestError(error)
			}

			return data
		}
	})
}

function useUpdateLedgerMutation() {
	const [supabase] = useState(supabaseClient())
	const userQuery = useUserQuery()

	return useMutation({
		mutationKey: LEDGER_QKEY,
		mutationFn: async (
			ledger: Pick<Ledger, "id" | "created_by" | "name" | "currency_id">
		) => {
			const user = userQuery.data
			if (!isNonNullable(user)) {
				throw Error(QueryHelper.MESSAGE_NO_USER)
			}

			if (ledger.name.length === 0) {
				throw Error(QueryHelper.MESSAGE_EMPTY_LEDGER_NAME)
			}

			const { data, error } = await supabase
				.from("ledger")
				.update({ name: ledger.name, currency_id: ledger.currency_id })
				.eq("id", ledger.id)
				.eq("created_by", ledger.created_by)
				.select("*, currency (currency_name), entry(count)")
				.single()

			if (error !== null) {
				throw new PostgrestError(error)
			}

			return data
		}
	})
}

function useDeleteLedgerMutation() {
	const [supabase] = useState(supabaseClient())
	const ledgersQuery = useLedgersQuery()

	return useMutation({
		mutationKey: LEDGER_QKEY,
		mutationFn: async (ledger: Pick<Ledger, "id">) => {
			const ledgersCount = ledgersQuery.data?.length
			if (!ledgersCount) {
				throw Error(QueryHelper.MESSAGE_NO_LEDGER)
			}

			if (ledgersCount < 2) {
				throw Error(QueryHelper.MESSAGE_REQUIRE_AT_LEAST_ONE_LEDGER)
			}

			const { data, error } = await supabase
				.from("ledger")
				.delete()
				.eq("id", ledger.id)
				.select("*, currency (currency_name), entry(count)")
				.single()

			if (error !== null) {
				throw new PostgrestError(error)
			}

			return data
		}
	})
}

function useSwitchLedgerMutation() {
	const [supabase] = useState(supabaseClient())
	const userQuery = useUserQuery()

	return useMutation({
		mutationKey: USER_SETTINGS_QKEY,
		mutationFn: async (ledger: Pick<Ledger, "id">) => {
			const user = userQuery.data
			if (!isNonNullable(user)) {
				throw Error(QueryHelper.MESSAGE_NO_USER)
			}

			const { data, error } = await supabase
				.from("settings")
				.update({ current_ledger: ledger.id })
				.eq("user_id", user.id)
				.select("*, ledger (name)")
				.single()

			if (error !== null) {
				throw new PostgrestError(error)
			}

			return data
		}
	})
}

function useInsertCategoryMutation() {
	const [supabase] = useState(supabaseClient())
	const userQuery = useUserQuery()

	return useMutation({
		mutationKey: CATEGORIES_QKEY,
		mutationFn: async (category: Category) => {
			const user = userQuery.data
			if (!isNonNullable(user)) {
				throw Error(QueryHelper.MESSAGE_NO_USER)
			}

			if (category.name.length === 0) {
				throw Error(QueryHelper.MESSAGE_EMPTY_CATEGORY_NAME)
			}

			const { data, error } = await supabase
				.from("category")
				.insert({
					created_by: user.id,
					name: category.name
				})
				.select("*")
				.single()

			if (error !== null) {
				throw new PostgrestError(error)
			}

			return data
		}
	})
}

function useUpdateCategoryMutation() {
	const [supabase] = useState(supabaseClient())
	const userQuery = useUserQuery()

	return useMutation({
		mutationKey: CATEGORIES_QKEY,
		mutationFn: async (category: Category & { oldName: string }) => {
			const user = userQuery.data
			if (!isNonNullable(user)) {
				throw Error(QueryHelper.MESSAGE_NO_USER)
			}

			if (category.name.length === 0) {
				throw Error(QueryHelper.MESSAGE_EMPTY_CATEGORY_NAME)
			}

			const { data, error } = await supabase
				.from("category")
				.update({
					name: category.name
				})
				.eq("name", category.oldName)
				.eq("created_by", user.id)
				.select("*")
				.single()

			if (error !== null) {
				throw new PostgrestError(error)
			}

			return data
		}
	})
}

function useDeleteCategoryMutation() {
	const [supabase] = useState(supabaseClient())
	const userQuery = useUserQuery()

	return useMutation({
		mutationKey: CATEGORIES_QKEY,
		mutationFn: async (category: Category) => {
			const user = userQuery.data
			if (!isNonNullable(user)) {
				throw Error(QueryHelper.MESSAGE_NO_USER)
			}

			const { data, error } = await supabase
				.from("category")
				.delete()
				.eq("created_by", category.created_by)
				.eq("name", category.name)
				.select()

			if (error !== null) {
				throw new PostgrestError(error)
			}

			return data
		}
	})
}

export {
	useDeleteCategoryMutation,
	useInsertCategoryMutation,
	useDeleteEntryMutation,
	useDeleteLedgerMutation,
	useInsertEntryMutation,
	useInsertLedgerMutation,
	useSwitchLedgerMutation,
	useUpdateCategoryMutation,
	useUpdateEntryMutation,
	useUpdateLedgerMutation
}
