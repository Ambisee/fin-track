import { PostgrestError } from "@supabase/supabase-js"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import {
	CATEGORIES_QKEY,
	CURRENCIES_QKEY,
	ENTRY_QKEY,
	LEDGER_QKEY,
	MONTH_GROUP_QKEY,
	PING_QUERY_STALE_TIME,
	QUERY_STALE_TIME,
	SERVER_PING_QKEY,
	SERVER_STATUS,
	USER_QKEY,
	USER_SETTINGS_QKEY
} from "./constants"
import { DateHelper, DateRange } from "./helper/DateHelper"
import { QueryHelper } from "./helper/QueryHelper"
import { supabaseClient } from "./supabase"
import { isNonNullable } from "./utils"
import {
	EntryDisplaySettings,
	PERIOD_TYPE
} from "@/components/user/TimeFilterControlPanel"

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
				.select(`*, ledger (*, currency (currency_name))`)
				.eq("user_id", user.id)
				.limit(1)
				.single()

			if (error !== null) {
				throw new PostgrestError(error)
			}

			return data
		},
		staleTime: QUERY_STALE_TIME,
		refetchOnWindowFocus: (query) =>
			query.state.data === undefined || query.state.isInvalidated,
		refetchOnMount: (query) =>
			query.state.data === undefined || query.state.isInvalidated,
		enabled: !!userQuery.data && !userQuery.isRefetching
	})
}

function useStatisticsQuery(
	ledger: number | undefined = undefined,
	dateRange: DateRange
) {
	const [supabase] = useState(supabaseClient())
	const userQuery = useUserQuery()

	return useQuery({
		queryKey: QueryHelper.getStatisticQueryKey(ledger, dateRange),
		queryFn: async ({ queryKey }) => {
			const user = userQuery.data
			if (!isNonNullable(user)) {
				throw Error(QueryHelper.MESSAGE_NO_USER)
			}

			const ledger = queryKey[1]
			const { from = new Date(), to = new Date() } = queryKey[2]

			if (!isNonNullable(ledger)) {
				throw Error(QueryHelper.MESSAGE_NO_LEDGER)
			}

			const { data, error } = await supabase.rpc("calculate_statistics", {
				p_start_ts: from.toDateString(),
				p_end_ts: to.toDateString(),
				p_ledger_id: ledger
			})

			if (error !== null) {
				throw new PostgrestError(error)
			}

			return data
		},
		staleTime: QUERY_STALE_TIME,
		refetchOnWindowFocus: (query) =>
			query.state.data === undefined || query.state.isInvalidated,
		refetchOnMount: (query) =>
			query.state.data === undefined || query.state.isInvalidated,
		enabled: !!ledger && !!userQuery.data && !userQuery.isRefetching
	})
}

function useEntryDataQuery(
	ledger: number | undefined = undefined,
	dateRange: DateRange
) {
	const [supabase] = useState(supabaseClient())
	const userQuery = useUserQuery()

	const isLedgerDefined = ledger !== undefined
	const isUserAuthenticated = !userQuery.isError && !!userQuery.data?.id

	return useQuery({
		queryKey: QueryHelper.getEntryQueryKey(ledger, dateRange),
		queryFn: async ({ queryKey }) => {
			const user = userQuery.data
			if (!isNonNullable(user)) {
				throw Error(QueryHelper.MESSAGE_NO_USER)
			}

			const from = queryKey[2].from ?? new Date()
			const to = queryKey[2].to ?? new Date()

			const { data, error } = await supabase
				.from("entry")
				.select(`*`)
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

			return data ?? []
		},
		enabled: isLedgerDefined && isUserAuthenticated
	})
}

function useFilterEntryDataQuery(
	ledger: number | undefined = undefined,
	filters: EntryDisplaySettings
) {
	const [supabase] = useState(supabaseClient())
	const userQuery = useUserQuery()

	const isLedgerDefined = ledger !== undefined
	const isUserAuthenticated = !userQuery.isError && !!userQuery.data?.id

	return useQuery({
		queryKey: QueryHelper.getFilterEntryQueryKey(ledger, filters),
		queryFn: async ({ queryKey }) => {
			const filters = queryKey[2]

			let dateRange: DateRange
			const today = new Date()

			switch (filters.period.type) {
				case "LAST_7_DAYS":
					const from = new Date(today)
					from.setDate(today.getDate() - 7)

					const to = today
					dateRange = { from, to }
					break
				case "YESTERDAY":
					const yesterday = new Date(today)
					yesterday.setDate(today.getDate() - 1)
					dateRange = { from: yesterday, to: yesterday }
					break
				case "MONTHLY":
				case "WEEKLY":
				case "YEARLY":
					if (isNonNullable(filters.period.timeRange)) {
						dateRange = filters.period.timeRange
						break
					}
				case "TODAY":
				default:
					dateRange = { from: today, to: today }
					break
			}

			const ledgerId = queryKey[1]
			if (!isNonNullable(ledgerId)) {
				throw Error("Invalid ledger ID.")
			}

			let query = supabase.from("entry").select("*").eq("ledger", ledgerId)

			const { from: dateFrom, to: dateTo } = dateRange
			if (isNonNullable(dateFrom))
				query = query.gte("date", dateFrom.toDateString())
			if (isNonNullable(dateTo))
				query = query.lte("date", dateTo.toDateString())

			const type = filters.filter.type
			if (type !== "All") {
				query = query.eq("is_positive", type === "Income")
			}

			const categories = filters.filter.categories
			if (isNonNullable(categories) && categories.length > 0) {
				query = query.in("category", categories)
			}

			query = query
				.order("date", { ascending: false })
				.order("category", { ascending: false })
				.order("id", { ascending: true })

			const { data, error } = await query

			if (isNonNullable(error)) {
				throw new PostgrestError(error)
			}

			return data ?? []
		},
		staleTime: QUERY_STALE_TIME,
		refetchOnWindowFocus: (query) =>
			query.state.data === undefined || query.state.isInvalidated,
		refetchOnMount: (query) =>
			query.state.data === undefined || query.state.isInvalidated,
		enabled: isLedgerDefined && isUserAuthenticated
	})
}

function useCurrenciesQuery() {
	const [supabase] = useState(supabaseClient())
	return useQuery({
		queryKey: CURRENCIES_QKEY,
		queryFn: async () => {
			const { data, error } = await supabase.from("currency").select("*")

			if (error !== null) {
				throw new PostgrestError(error)
			}
			return data ?? []
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

			return data ?? []
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
				.select("*, currency (currency_name), entry(count)")
				.eq("created_by", user.id)
				.order("name")

			if (error !== null) {
				throw new PostgrestError(error)
			}

			return data ?? []
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

function useServerPingQuery() {
	const query = useQuery({
		queryKey: SERVER_PING_QKEY,
		queryFn: async () => {
			const response = await fetch("/api/ping")
			if (!response.ok) {
				throw Error()
			}

			return SERVER_STATUS.ONLINE
		},
		retry: 3,
		staleTime: PING_QUERY_STALE_TIME,
		refetchOnMount: (query) => query.state.isInvalidated
	})

	let data: number
	if (query.error !== null) {
		data = SERVER_STATUS.OFFLINE
	} else if (query.data === SERVER_STATUS.ONLINE) {
		data = SERVER_STATUS.ONLINE
	} else {
		data = SERVER_STATUS.LOADING
	}

	return { ...query, data }
}

export {
	useCategoriesQuery,
	useCurrenciesQuery,
	useEntryDataQuery,
	useFilterEntryDataQuery,
	useLedgersQuery,
	useMonthGroupQuery,
	useServerPingQuery,
	useSettingsQuery,
	useStatisticsQuery,
	useUserQuery
}
