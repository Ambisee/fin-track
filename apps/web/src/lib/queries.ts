import { Category } from "@/types/Category"
import { Currency } from "@/types/Currency"
import { Entry } from "@/types/Entry"
import { Ledger } from "@/types/Ledger"
import { Settings } from "@/types/Settings"
import { isNonNullable } from "@fintrack/utils"
import { PostgrestError } from "@supabase/supabase-js"
import {
	queryOptions,
	useQueries,
	useQuery,
	useQueryClient
} from "@tanstack/react-query"
import { useState } from "react"
import {
	CATEGORIES_QKEY,
	CURRENCIES_QKEY,
	LEDGER_QKEY,
	MONTH_GROUP_QKEY,
	QUERY_STALE_TIME,
	USER_QKEY,
	USER_SETTINGS_QKEY
} from "./constants"
import { DateRange } from "./helper/DateHelper"
import { QueryHelper } from "./helper/QueryHelper"
import { supabaseClient } from "./supabase"
import { getMonthSpansForDateRange } from "./utils"

function useUserQuery() {
	const [supabase] = useState(supabaseClient())

	return useQuery({
		queryKey: USER_QKEY,
		queryFn: async () => {
			const {
				data: { user },
				error
			} = await supabase.auth.getUser()

			if (isNonNullable(error)) {
				throw error
			}

			return user
		},
		refetchOnWindowFocus: false,
		refetchOnMount: (query) =>
			!isNonNullable(query.state.data) || query.state.isInvalidated
	})
}

function useSettingsQuery() {
	const [supabase] = useState(supabaseClient())
	const userQuery = useUserQuery()

	return useQuery({
		queryKey: USER_SETTINGS_QKEY,
		queryFn: async () => {
			const user = userQuery.data
			if (!isNonNullable(user)) {
				throw Error(QueryHelper.MESSAGE_NO_USER)
			}

			const { data, error } = await supabase
				.from("settings")
				.select(`*, ledger (*, currency (id, name:currency_name))`)
				.eq("user_id", user.id)
				.limit(1)
				.single()

			if (error !== null) {
				throw new PostgrestError(error)
			}

			return {
				userId: data.user_id,
				allowMonthEndReport: data.allow_report,
				visibleLedger: {
					id: data.ledger.id,
					name: data.ledger.name,
					isInMonthEndRecap: data.ledger.is_in_month_end_recap ?? false,
					currency: {
						id: data.ledger.currency.id,
						name: data.ledger.currency.name
					}
				}
			} satisfies Settings
		},
		staleTime: QUERY_STALE_TIME,
		refetchOnWindowFocus: (query) =>
			query.state.data === undefined || query.state.isInvalidated,
		refetchOnMount: (query) =>
			query.state.data === undefined || query.state.isInvalidated,
		enabled: !!userQuery.data && !userQuery.isRefetching
	})
}

function useEntryDataQuery(ledger: number | undefined, dateRange: DateRange) {
	const [supabase] = useState(supabaseClient())
	const userQuery = useUserQuery()

	const isLedgerDefined = ledger !== undefined
	const isUserAuthenticated = !userQuery.isError && !!userQuery.data?.id

	const queryKeys = QueryHelper.getEntryQueryKeys(ledger, dateRange)

	const entryOption = (queryKey: (typeof queryKeys)[number]) =>
		queryOptions({
			queryKey: queryKey,
			queryFn: async ({ queryKey }) => {
				const user = userQuery.data
				if (!isNonNullable(user)) {
					throw Error(QueryHelper.MESSAGE_NO_USER)
				}

				const from = queryKey[2].from ?? new Date()
				const to = queryKey[2].to ?? new Date()

				const { data, error } = await supabase
					.from("entry")
					.select(
						`
                        id, 
                        amount, 
                        date, 
                        is_positive, 
                        note, 
                        category,
                        ledger (*, currency (id, name:currency_name))`
					)
					.eq("created_by", user.id)
					.eq("ledger", ledger!)
					.gte("date", from.toDateString())
					.lte("date", to.toDateString())
					.order("date", { ascending: false })
					.order("category", { ascending: false })
					.order("id", { ascending: true })

				if (error !== null) {
					throw new PostgrestError(error)
				}

				return (
					data.map(
						(v) =>
							({
								id: v.id,
								amount: v.amount,
								date: new Date(v.date),
								type: v.is_positive ? "Income" : "Expense",
								category: v.category,
								note: v.note,
								ledger: {
									id: v.ledger.id,
									name: v.ledger.name,
									isInMonthEndRecap: v.ledger.is_in_month_end_recap,
									currency: {
										id: v.ledger.currency.id,
										name: v.ledger.currency.name
									}
								}
							}) satisfies Entry
					) ?? []
				)
			},
			staleTime: QUERY_STALE_TIME,
			refetchOnWindowFocus: (query) =>
				query.state.data === undefined || query.state.isInvalidated,
			refetchOnMount: (query) =>
				query.state.data === undefined || query.state.isInvalidated,
			enabled: isLedgerDefined && isUserAuthenticated
		})

	return useQueries({
		queries: queryKeys.map((qKey) => entryOption(qKey))
	})
}

function useCurrenciesQuery() {
	const [supabase] = useState(supabaseClient())
	return useQuery({
		queryKey: CURRENCIES_QKEY,
		queryFn: async () => {
			const { data, error } = await supabase
				.from("currency")
				.select("id, name:currency_name")

			if (error !== null) {
				throw new PostgrestError(error)
			}
			return (
				data.map(
					(v) =>
						({
							id: v.id,
							name: v.name
						}) satisfies Currency
				) ?? []
			)
		},
		staleTime: QUERY_STALE_TIME,
		refetchOnWindowFocus: (query) =>
			query.state.data === undefined || query.state.isInvalidated,
		refetchOnMount: (query) =>
			query.state.data === undefined || query.state.isInvalidated
	})
}

function useCategoriesQuery() {
	const [supabase] = useState(supabaseClient())
	const userQuery = useUserQuery()

	return useQuery({
		queryKey: CATEGORIES_QKEY,
		queryFn: async () => {
			const user = userQuery.data
			if (!isNonNullable(user)) {
				throw Error(QueryHelper.MESSAGE_NO_USER)
			}

			const { data, error } = await supabase
				.from("category")
				.select("*")
				.eq("created_by", user.id)
				.order("name")

			if (error !== null) {
				throw new PostgrestError(error)
			}

			return (
				data.map(
					(v) => ({ id: v.created_by, name: v.name }) satisfies Category
				) ?? []
			)
		},
		staleTime: QUERY_STALE_TIME,
		refetchOnWindowFocus: false,
		refetchOnMount: (query) => !!query.state.data || query.state.isInvalidated,
		enabled: !!userQuery.data && !userQuery.isRefetching
	})
}

function useLedgersQuery() {
	const [supabase] = useState(supabaseClient())
	const userQuery = useUserQuery()

	return useQuery({
		queryKey: LEDGER_QKEY,
		queryFn: async () => {
			const user = userQuery.data
			if (!isNonNullable(user)) {
				throw Error(QueryHelper.MESSAGE_NO_USER)
			}

			const { data, error } = await supabase
				.from("ledger")
				.select("*, currency (id, name:currency_name)")
				.eq("created_by", user.id)
				.order("name")

			if (error !== null) {
				throw new PostgrestError(error)
			}

			return (
				data.map(
					(v) =>
						({
							id: v.id,
							name: v.name,
							isInMonthEndRecap: v.is_in_month_end_recap ?? false,
							currency: {
								id: v.currency.id,
								name: v.currency.name
							}
						}) satisfies Ledger
				) ?? []
			)
		},
		staleTime: QUERY_STALE_TIME,
		refetchOnWindowFocus: false,
		refetchOnMount: (query) => !!query.state.data || query.state.isInvalidated,
		enabled: !!userQuery.data && !userQuery.isRefetching
	})
}

function useMonthGroupQuery(ledger_id?: number) {
	const [supabase] = useState(supabaseClient())
	const userQuery = useUserQuery()

	return useQuery({
		queryKey: [MONTH_GROUP_QKEY, ledger_id],
		queryFn: async () => {
			const user = userQuery.data
			if (!isNonNullable(user)) {
				throw Error(QueryHelper.MESSAGE_NO_USER)
			}

			if (!isNonNullable(ledger_id)) {
				throw Error(QueryHelper.MESSAGE_NO_LEDGER)
			}

			const { data, error } = await supabase
				.from("month_groups")
				.select("*")
				.eq("created_by", user.id)
				.eq("ledger_id", ledger_id)
				.order("year, month", { ascending: true })

			if (error !== null) {
				throw new PostgrestError(error)
			}

			return data ?? []
		},
		refetchOnWindowFocus: false,
		refetchOnMount: (query) => query.state.isInvalidated,
		enabled: !!userQuery.data && !userQuery.isRefetching && !!ledger_id
	})
}

function useInvalidateUserQuery() {
	const queryClient = useQueryClient()
	return () => queryClient.invalidateQueries({ queryKey: USER_QKEY })
}

function useInvalidateEntryDataQuery() {
	const queryClient = useQueryClient()
	return (ledger: number, dateRange: DateRange) => {
		return Promise.all(
			getMonthSpansForDateRange(dateRange).map((span) => {
				return queryClient.invalidateQueries({
					queryKey: QueryHelper.getEntryQueryKey(ledger, span)
				})
			})
		)
	}
}

function useInvalidateMonthGroupQuery() {
	const queryClient = useQueryClient()
	return (ledger: number) => {
		return queryClient.invalidateQueries({
			queryKey: QueryHelper.getMonthGroupQueryKey(ledger)
		})
	}
}

export {
	useCategoriesQuery,
	useCurrenciesQuery,
	useEntryDataQuery,
	useInvalidateEntryDataQuery,
	useInvalidateUserQuery,
	useInvalidateMonthGroupQuery,
	useLedgersQuery,
	useMonthGroupQuery,
	useSettingsQuery,
	useUserQuery
}
