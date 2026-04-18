import { Entry } from "@/types/supabase"
import { useCallback, useEffect, useRef, useState } from "react"
import { DatabaseHelper } from "./helper/DatabaseHelper"
import { supabaseClient } from "./supabase"
import { isNonNullable } from "./utils"
import { useSettingsQuery } from "./queries"

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
