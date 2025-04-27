import { EntryFormData } from "@/components/user/EntryForm/EntryForm"
import { Category, Entry, Ledger } from "@/types/supabase"
import {
    useMutation,
    useQuery
} from "@tanstack/react-query"
import { useCallback, useEffect, useRef, useState } from "react"
import {
    CATEGORIES_QKEY,
    CURRENCIES_QKEY,
    LEDGER_QKEY,
    MONTH_GROUP_QKEY,
    QUERY_STALE_TIME,
    USER_QKEY,
    USER_SETTINGS_QKEY
} from "./constants"
import { DatabaseHelper } from "./helper/DatabaseHelper"
import { DateHelper } from "./helper/DateHelper"
import { QueryHelper } from "./helper/QueryHelper"
import { sbBrowser } from "./supabase"
import { isNonNullable } from "./utils"

function useUserQuery() {
	return useQuery({
		queryKey: USER_QKEY,
		queryFn: async () => {
			const { data: { user }, error } = await sbBrowser.auth.getUser()

			if (isNonNullable(error)) {
				throw error
			}

			return user
		},
		refetchOnWindowFocus: false,
		refetchOnMount: (query) => !isNonNullable(query.state.data)
	})
}

function useSettingsQuery() {
	const userQuery = useUserQuery()

	return useQuery({
		queryKey: USER_SETTINGS_QKEY,
		queryFn: async () => {
			const user = userQuery.data
			if (!isNonNullable(user)) {
				throw Error(QueryHelper.MESSAGE_NO_USER)
			}

			const { data } = await sbBrowser
				.from("settings")
				.select(`*, ledger (*, currency (currency_name))`)
				.eq("user_id", user.id)
				.limit(1)
				.single()
                .throwOnError()

			return data
		},
		staleTime: QUERY_STALE_TIME,
		refetchOnWindowFocus: false,
		refetchOnMount: (query) => !isNonNullable(query.state.data),
		enabled: !!userQuery.data && !userQuery.isRefetching
	})
}

function useStatisticsQuery(ledger?: number, period: Date = new Date()) {
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

            const { data } = await sbBrowser
                .from("statistic")
                .select("*")
                .eq("ledger", ledger!)
                .eq("created_by", user.id)
                .lte("period", end.toDateString())
                .gte("period", start.toDateString()) 

            return data ?? []
        },
        staleTime: QUERY_STALE_TIME,
		refetchOnWindowFocus: false,
		refetchOnMount: (query) => query.state.data === undefined,
        enabled:
            !!ledger &&
            !!userQuery.data &&
            !userQuery.isRefetching
    })
}

function useEntryDataQuery(ledger?: number, period: Date = new Date()) {
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

            const { data } = await sbBrowser
                .from("entry")
                .select(`*`)
                .eq("created_by", user.id)
                .eq("ledger", ledger!)
                .lte("date", end.toDateString())
                .gte("date", start.toDateString())
                .order("date", {ascending: false})
                .order("category", {ascending: false})
                .order("id", {ascending: true})
                .throwOnError()

            return data ?? []
        },
        staleTime: QUERY_STALE_TIME,
		refetchOnWindowFocus: false,
		refetchOnMount: (query) => query.state.data === undefined,
		enabled:
			!!userQuery.data &&
            !!ledger &&
			!userQuery.isRefetching
	})
}


function useCurrenciesQuery() {
	return useQuery({
		queryKey: CURRENCIES_QKEY,
		queryFn: async () => {
            const { data } = await sbBrowser.from("currency").select("*").throwOnError()
            return data ?? []
        },
		staleTime: QUERY_STALE_TIME,
		refetchOnWindowFocus: false,
		refetchOnMount: (query) => query.state.data === undefined
	})
}

function useCategoriesQuery() {
	const userQuery = useUserQuery()

	return useQuery({
		queryKey: CATEGORIES_QKEY,
		queryFn: async () => {
			const user = userQuery.data
			if (!isNonNullable(user)) {
				throw Error(QueryHelper.MESSAGE_NO_USER)
			}

			const { data } = await sbBrowser
				.from("category")
				.select("*")
				.eq("created_by", user.id)
				.order("name")
                .throwOnError()

			return data ?? []
		},
		staleTime: QUERY_STALE_TIME,
		refetchOnWindowFocus: false,
		refetchOnMount: (query) => !!query.state.data,
		enabled: !!userQuery.data && !userQuery.isRefetching
	})
}

function useLedgersQuery() {
	const userQuery = useUserQuery()

	return useQuery({
		queryKey: LEDGER_QKEY,
		queryFn: async () => {
			const user = userQuery.data
			if (!isNonNullable(user)) {
				throw Error(QueryHelper.MESSAGE_NO_USER)
			}

			const { data } = await sbBrowser
				.from("ledger")
				.select("*, currency (currency_name), entry(count)")
				.eq("created_by", user.id)
				.order("name")
                .throwOnError()

			return data ?? []
		},
		staleTime: QUERY_STALE_TIME,
		refetchOnWindowFocus: false,
		refetchOnMount: (query) => !!query.state.data,
		enabled: !!userQuery.data && !userQuery.isRefetching
	})
}

function useMonthGroupQuery(ledger_id?: number) {
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

			const { data } = await sbBrowser
				.from("month_groups")
				.select("*")
				.eq("created_by", user.id)
				.eq("ledger_id", ledger_id)
				.order("year, month", { ascending: true })
                .throwOnError()

			return data ?? []
		},
		refetchOnWindowFocus: false,
		enabled:
			!!userQuery.data && !userQuery.isRefetching && !!ledger_id
	})
}

function useInsertEntryMutation() {
    const userQuery = useUserQuery()

	return useMutation({
		mutationFn: async (entry: EntryFormData) => {
			const user = userQuery.data
			if (!user) {
				throw Error(QueryHelper.MESSAGE_NO_USER)
			}

			const isPositive = entry.type === "Income"
			let note: string | null = entry.note
			if (note === "") {
				note = null
			}

			const { data } = await sbBrowser
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
                .throwOnError()

			return data
		}
	})
}

function useDeleteEntryMutation() {
	const userQuery = useUserQuery()

	return useMutation({
		mutationFn: async (id: number) => {
			const user = userQuery.data
			if (!user) {
				throw Error(QueryHelper.MESSAGE_NO_USER)
			}

			const { data } = await sbBrowser
				.from("entry")
				.delete()
				.eq("created_by", user.id)
				.eq("id", id)
				.select("*")
				.single()
				.throwOnError()

			return data
		}
	})
}

function useUpdateEntryMutation() {
	return useMutation({
		mutationFn: async (entry: EntryFormData & { id: number }) => {
			const isPositive = entry.type === "Income"

			let note: string | null = entry.note
			if (note === "") {
				note = null
			}

			const { data, error } = await sbBrowser
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
                .throwOnError()

			return data
		}
	})
}

function useInsertLedgerMutation() {
	const userQuery = useUserQuery()

	return useMutation({
		mutationKey: LEDGER_QKEY,
		mutationFn: async (ledger: Pick<Ledger, "created_by" | "name" | "currency_id">) => {
			const user = userQuery.data
			if (!isNonNullable(user)) {
				throw Error(QueryHelper.MESSAGE_NO_USER)
			}

			const { data } = await sbBrowser
				.from("ledger")
				.insert({
					created_by: user.id,
					name: ledger.name,
					currency_id: ledger.currency_id
				})
				.select("*, currency (currency_name), entry(count)")
				.single()
                .throwOnError()

			return data
		}
	})
}

function useUpdateLedgerMutation() {
	const userQuery = useUserQuery()

	return useMutation({
		mutationKey: LEDGER_QKEY,
		mutationFn: async (ledger: Pick<Ledger, "id" | "created_by" | "name" | "currency_id">) => {
			const user = userQuery.data
            if (!isNonNullable(user)) {
				throw Error(QueryHelper.MESSAGE_NO_USER)
			}

			const { data } = await sbBrowser
				.from("ledger")
				.update({ name: ledger.name, currency_id: ledger.currency_id })
				.eq("id", ledger.id)
				.eq("created_by", ledger.created_by)
				.select("*, currency (currency_name), entry(count)")
				.single()
                .throwOnError()

			return data
		}
	})
}

function useDeleteLedgerMutation() {
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

			const { data } = await sbBrowser
				.from("ledger")
				.delete()
				.eq("id", ledger.id)
				.select("*, currency (currency_name), entry(count)")
				.single()
                .throwOnError()

			return data
		}
	})
}

function useSwitchLedgerMutation() {
	const userQuery = useUserQuery()

	return useMutation({
		mutationKey: USER_SETTINGS_QKEY,
		mutationFn: async (ledger: Pick<Ledger, "id">) => {
			const user = userQuery.data
            if (!isNonNullable(user)) {
				throw Error(QueryHelper.MESSAGE_NO_USER)
			}

			const { data } = await sbBrowser
				.from("settings")
				.update({ current_ledger: ledger.id })
				.eq("user_id", user.id)
				.select("*, ledger (name)")
				.single()
                .throwOnError()

			return data
		}
	})
}

function useInsertCategoryMutation() {
	const userQuery = useUserQuery()

	return useMutation({
		mutationKey: CATEGORIES_QKEY,
		mutationFn: async (category: Category) => {
			const user = userQuery.data
			if (!isNonNullable(user)) {
				throw Error(QueryHelper.MESSAGE_NO_USER)
			}

			const { data } = await sbBrowser
				.from("category")
				.insert({
					created_by: user.id,
					name: category.name
				})
				.select("*")
				.single()
                .throwOnError()


			return data
		}
	})
}

function useUpdateCategoryMutation() {
	const userQuery = useUserQuery()

	return useMutation({
		mutationKey: CATEGORIES_QKEY,
		mutationFn: async (category: Category & { oldName: string }) => {
			const user = userQuery.data
			if (!isNonNullable(user)) {
				throw Error(QueryHelper.MESSAGE_NO_USER)
			}

			const { data } = await sbBrowser
				.from("category")
				.update({
					name: category.name
				})
				.eq("name", category.oldName)
				.eq("created_by", user.id)
				.select("*")
				.single()
                .throwOnError()

			return data
		}
	})
}

function useDeleteCategoryMutation() {
	const userQuery = useUserQuery()

	return useMutation({
		mutationKey: CATEGORIES_QKEY,
		mutationFn: async (category: Category) => {
			const user = userQuery.data
			if (!isNonNullable(user)) {
				throw Error(QueryHelper.MESSAGE_NO_USER)
			}

			const { data } = await sbBrowser
				.from("category")
				.delete()
				.eq("created_by", category.created_by)
				.eq("name", category.name)
				.select()
                .throwOnError()

			return data
		}
	})
}

function useSearch() {
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResult, setSearchResult] = useState<Entry[] | null>(null)

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery === "") {
                setSearchResult(null)
                return
            }
    
            const { data, error } = await sbBrowser.rpc("search_entry", {
                query: DatabaseHelper.parseSearchQuery(searchQuery)
            })
    
            if (error != null || !isNonNullable(data)) {
                setSearchResult(null)
                return
            }
    
            setSearchResult(data)
        }, 350)
        
        return () => {
            clearTimeout(timer)
        }
    }, [searchQuery])

    return {
        searchResult,
        searchQuery,
        setSearchQuery,
    }
}

function useSetElementWindowHeight() {
	const elementRef = useRef<HTMLDivElement>(null!)

	useEffect(() => {
		const resizeObserver = new ResizeObserver((entries) => {
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
    useCurrenciesQuery, useDeleteCategoryMutation, useDeleteEntryMutation, useDeleteLedgerMutation,
    useEntryDataQuery, useInsertCategoryMutation, useInsertEntryMutation, useInsertLedgerMutation,
    useLedgersQuery,
    useMonthGroupQuery, useSearch, useSetElementWindowHeight,
    useSettingsQuery, useStatisticsQuery, useSwitchLedgerMutation,
    useUpdateCategoryMutation, useUpdateEntryMutation, useUpdateLedgerMutation,
    useUserQuery
}

