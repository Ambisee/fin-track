import { EntryFormData } from "@/components/user/EntryForm/EntryForm"
import { Category, Entry, Ledger } from "@/types/supabase"
import { PostgrestError } from "@supabase/supabase-js"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useCallback, useEffect, useRef, useState } from "react"
import {
	CATEGORIES_QKEY,
	CURRENCIES_QKEY,
	LEDGER_QKEY,
	MONTH_GROUP_QKEY,
	PING_QUERY_STALE_TIME,
	QUERY_STALE_TIME,
	SERVER_PING_QKEY,
	SERVER_STATUS,
	USER_QKEY,
	USER_SETTINGS_QKEY
} from "./constants"
import { DatabaseHelper } from "./helper/DatabaseHelper"
import { DateHelper } from "./helper/DateHelper"
import { QueryHelper } from "./helper/QueryHelper"
import { supabaseClient } from "./supabase"
import { isNonNullable } from "./utils"

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
		refetchOnWindowFocus: false,
		refetchOnMount: (query) =>
			!isNonNullable(query.state.data) || query.state.isInvalidated,
		enabled: !!userQuery.data && !userQuery.isRefetching
	})
}

function useStatisticsQuery(ledger?: number, period: Date = new Date()) {
	const [supabase] = useState(supabaseClient())
	const userQuery = useUserQuery()
	const queryKey = QueryHelper.getStatisticQueryKey(ledger, period)
	const { start, end } = DateHelper.getMonthStartEnd(period)

	return useQuery({
		queryKey,
		queryFn: async () => {
			const user = userQuery.data
			if (!isNonNullable(user)) {
				throw Error(QueryHelper.MESSAGE_NO_USER)
			}

			const { data, error } = await supabase
				.from("statistic")
				.select("*")
				.eq("ledger", ledger!)
				.eq("created_by", user.id)
				.lte("period", end.toDateString())
				.gte("period", start.toDateString())

			if (error !== null) {
				throw new PostgrestError(error)
			}

			return data ?? []
		},
		staleTime: QUERY_STALE_TIME,
		refetchOnWindowFocus: false,
		refetchOnMount: (query) =>
			query.state.data === undefined || query.state.isInvalidated,
		enabled: !!ledger && !!userQuery.data && !userQuery.isRefetching
	})
}

function useEntryDataQuery(ledger?: number, period: Date = new Date()) {
	const [supabase] = useState(supabaseClient())
	const userQuery = useUserQuery()

	const queryKey = QueryHelper.getEntryQueryKey(ledger, period)
	const { start, end } = DateHelper.getMonthStartEnd(period)

	return useQuery({
		queryKey,
		queryFn: async () => {
			const user = userQuery.data
			if (!isNonNullable(user)) {
				throw Error(QueryHelper.MESSAGE_NO_USER)
			}

			const { data, error } = await supabase
				.from("entry")
				.select(`*`)
				.eq("created_by", user.id)
				.eq("ledger", ledger!)
				.lte("date", end.toDateString())
				.gte("date", start.toDateString())
				.order("date", { ascending: false })
				.order("category", { ascending: false })
				.order("id", { ascending: true })

			if (error !== null) {
				throw new PostgrestError(error)
			}

			return data ?? []
		},
		staleTime: QUERY_STALE_TIME,
		refetchOnWindowFocus: false,
		refetchOnMount: (query) =>
			query.state.data === undefined || query.state.isInvalidated,
		enabled: !!userQuery.data && !!ledger && !userQuery.isRefetching
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
		refetchOnWindowFocus: false,
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

function useSearchEntry() {
	const [isSearching, setIsSearching] = useState(false)
	const [searchQuery, setSearchQuery] = useState("")
	const [searchResult, setSearchResult] = useState<Entry[] | null>(null)

	useEffect(() => {
		const supabase = supabaseClient()
		const timer = setTimeout(async () => {
			if (searchQuery === "") {
				setSearchResult(null)
				return
			}

			setIsSearching(true)
			const { data, error } = await supabase.rpc("search_entry", {
				query: DatabaseHelper.parseSearchQuery(searchQuery)
			})

			if (error != null || !isNonNullable(data)) {
				setSearchResult(null)
				return
			}

			setSearchResult(data)
			setIsSearching(false)
		}, 350)

		return () => {
			clearTimeout(timer)
		}
	}, [searchQuery])

	return {
		isSearching,
		searchResult,
		searchQuery,
		setSearchQuery
	}
}

function useSetElementWindowHeight() {
	const elementRef = useRef<HTMLDivElement>(null!)

	useEffect(() => {
		const resizeObserver = new ResizeObserver(() => {
			if (elementRef.current === undefined || elementRef.current === null) {
				return
			}

			elementRef.current.style.minHeight = `${window.innerHeight}px`
		})

		resizeObserver.observe(document.body)

		return () => {
			resizeObserver.disconnect()
		}
	}, [elementRef])

	return elementRef
}

function useAmountFormatter() {
	const userSettingsQuery = useSettingsQuery()

	const formatAmount = useCallback(
		(num?: number) => {
			const currency = userSettingsQuery.data?.ledger?.currency?.currency_name
			if (!isNonNullable(num) || !isNonNullable(currency)) {
				return num
			}

			if (!Intl.supportedValuesOf("currency").includes(currency)) {
				return num.toFixed(2)
			}

			return new Intl.NumberFormat(navigator.language, {
				style: "currency",
				currency: currency,
				currencyDisplay: "narrowSymbol"
			}).format(num)
		},
		[userSettingsQuery]
	)

	return formatAmount
}

export {
	useAmountFormatter,
	useCategoriesQuery,
	useCurrenciesQuery,
	useDeleteCategoryMutation,
	useDeleteEntryMutation,
	useDeleteLedgerMutation,
	useEntryDataQuery,
	useInsertCategoryMutation,
	useInsertEntryMutation,
	useInsertLedgerMutation,
	useLedgersQuery,
	useMonthGroupQuery,
	useSearchEntry,
	useServerPingQuery,
	useSetElementWindowHeight,
	useSettingsQuery,
	useStatisticsQuery,
	useSwitchLedgerMutation,
	useUpdateCategoryMutation,
	useUpdateEntryMutation,
	useUpdateLedgerMutation,
	useUserQuery
}
