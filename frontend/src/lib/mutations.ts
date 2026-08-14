import { EntryFormData } from "@/components/user/EntryForm/EntryForm"
import { Category } from "@/types/Category"
import { Entry } from "@/types/Entry"
import { Ledger } from "@/types/Ledger"
import { Settings } from "@/types/Settings"
import { PostgrestError } from "@supabase/supabase-js"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { CATEGORIES_QKEY, LEDGER_QKEY, USER_SETTINGS_QKEY } from "./constants"
import { DateHelper } from "./helper/DateHelper"
import { QueryHelper } from "./helper/QueryHelper"
import { useLedgersQuery, useUserQuery } from "./queries"
import { supabaseClient } from "./supabase"
import { isNonNullable } from "./utils"

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
				.select(
					`
                        id,
                        is_positive,
                        amount,
                        date,
                        category,
                        note,
                        ledger (
                            *,
                            currency (
                                id,
                                name:currency_name
                            )
                        )
                    `
				)
				.single()

			if (error !== null) {
				throw new PostgrestError(error)
			}

			return {
				id: data.id,
				type: data.is_positive ? "Income" : "Expense",
				amount: data.amount,
				date: new Date(data.date),
				category: data.category,
				note: data.note,
				ledger: {
					id: data.ledger.id,
					name: data.ledger.name,
					currency: {
						id: data.ledger.currency.id,
						name: data.ledger.currency.name
					}
				}
			} satisfies Entry
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
				.select(
					`
                        id,
                        is_positive,
                        amount,
                        date,
                        category,
                        note,
                        ledger (
                            *,
                            currency (
                                id,
                                name:currency_name
                            )
                        )
                    `
				)
				.single()

			if (error !== null) {
				throw new PostgrestError(error)
			}

			return {
				id: data.id,
				type: data.is_positive ? "Income" : "Expense",
				amount: data.amount,
				date: new Date(data.date),
				category: data.category,
				note: data.note,
				ledger: {
					id: data.ledger.id,
					name: data.ledger.name,
					currency: {
						id: data.ledger.currency.id,
						name: data.ledger.currency.name
					}
				}
			} satisfies Entry
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
				.select(
					`
                        id,
                        is_positive,
                        amount,
                        date,
                        category,
                        note,
                        ledger (
                            *,
                            currency (
                                id,
                                name:currency_name
                            )
                        )
                    `
				)
				.single()

			if (error !== null) {
				throw new PostgrestError(error)
			}

			return {
				id: data.id,
				type: data.is_positive ? "Income" : "Expense",
				amount: data.amount,
				date: new Date(data.date),
				category: data.category,
				note: data.note,
				ledger: {
					id: data.ledger.id,
					name: data.ledger.name,
					currency: {
						id: data.ledger.currency.id,
						name: data.ledger.currency.name
					}
				}
			} satisfies Entry
		}
	})
}

function useInsertLedgerMutation() {
	const [supabase] = useState(supabaseClient())
	const userQuery = useUserQuery()

	return useMutation({
		mutationKey: LEDGER_QKEY,
		mutationFn: async (ledger: Ledger) => {
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
					currency_id: ledger.currency.id
				})
				.select("*, currency (id, name:currency_name)")
				.single()

			if (error !== null) {
				throw new PostgrestError(error)
			}

			return {
				id: data.id,
				name: data.name,
				currency: {
					id: data.currency.id,
					name: data.currency.name
				}
			} satisfies Ledger
		}
	})
}

function useUpdateLedgerMutation() {
	const [supabase] = useState(supabaseClient())
	const userQuery = useUserQuery()

	return useMutation({
		mutationKey: LEDGER_QKEY,
		mutationFn: async (ledger: Ledger) => {
			const user = userQuery.data
			if (!isNonNullable(user)) {
				throw Error(QueryHelper.MESSAGE_NO_USER)
			}

			if (ledger.name.length === 0) {
				throw Error(QueryHelper.MESSAGE_EMPTY_LEDGER_NAME)
			}

			const { data, error } = await supabase
				.from("ledger")
				.update({ name: ledger.name, currency_id: ledger.currency.id })
				.eq("id", ledger.id)
				.eq("created_by", user.id)
				.select("*, currency (id, name:currency_name)")
				.single()

			if (error !== null) {
				throw new PostgrestError(error)
			}

			return {
				id: data.id,
				name: data.name,
				currency: {
					id: data.currency.id,
					name: data.currency.name
				}
			} satisfies Ledger
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
				.select("*, currency (id, name:currency_name)")
				.single()

			if (error !== null) {
				throw new PostgrestError(error)
			}

			return {
				id: data.id,
				name: data.name,
				currency: {
					id: data.currency.id,
					name: data.currency.name
				}
			} satisfies Ledger
		}
	})
}

function useSwitchLedgerMutation() {
	const [supabase] = useState(supabaseClient())
	const userQuery = useUserQuery()

	return useMutation({
		mutationKey: USER_SETTINGS_QKEY,
		mutationFn: async (ledger: Ledger) => {
			const user = userQuery.data
			if (!isNonNullable(user)) {
				throw Error(QueryHelper.MESSAGE_NO_USER)
			}

			const { data, error } = await supabase
				.from("settings")
				.update({ current_ledger: ledger.id })
				.eq("user_id", user.id)
				.select("*, ledger (id, name, currency (id, name:currency_name))")
				.single()

			if (error !== null) {
				throw new PostgrestError(error)
			}

			return {
				userId: data.user_id,
				allowMonthlyReport: data.allow_report,
				visibleLedger: {
					id: data.ledger.id,
					name: data.ledger.name,
					currency: {
						id: data.ledger.currency.id,
						name: data.ledger.currency.name
					}
				}
			} satisfies Settings
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

			return {
				id: data.created_by,
				name: data.name
			} satisfies Category
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

			return {
				id: data.created_by,
				name: data.name
			} satisfies Category
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
				.eq("created_by", category.id)
				.eq("name", category.name)
				.select("*")
				.single()

			if (error !== null) {
				throw new PostgrestError(error)
			}

			return {
				id: data.created_by,
				name: data.name
			} satisfies Category
		}
	})
}

export {
	useDeleteCategoryMutation,
	useDeleteEntryMutation,
	useDeleteLedgerMutation,
	useInsertCategoryMutation,
	useInsertEntryMutation,
	useInsertLedgerMutation,
	useSwitchLedgerMutation,
	useUpdateCategoryMutation,
	useUpdateEntryMutation,
	useUpdateLedgerMutation
}
