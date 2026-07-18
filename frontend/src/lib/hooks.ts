import { EntryDisplaySettings } from "@/components/user/TimeFilterControlPanel"
import { Entry } from "@/types/supabase"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useMediaQuery } from "react-responsive"
import { SMALL_MOBILE_BREKPOINT } from "./constants"
import { DatabaseHelper } from "./helper/DatabaseHelper"
import { useEntryDataQuery, useSettingsQuery } from "./queries"
import { supabaseClient } from "./supabase"
import {
	findBoundIndicies,
	getDateRangeFromDisplaySettings,
	isNonNullable
} from "./utils"
import { DateHelper } from "./helper/DateHelper"

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

function useDashboardTransactionEntries(
	ledgerId: number | undefined,
	viewOptions: EntryDisplaySettings
) {
	const [today] = useState(new Date())
	const dateRange = getDateRangeFromDisplaySettings(today, viewOptions)

	const entryDataQueries = useEntryDataQuery(ledgerId, dateRange)
	return useMemo(() => {
		const queryResults = {
			data: entryDataQueries.flatMap((q) => q.data?.toReversed() ?? []),
			errors: entryDataQueries.flatMap((q) => q.error),
			isPending: entryDataQueries.reduce((acc, q) => q.isPending || acc, false),
			isFetching: entryDataQueries.reduce(
				(acc, q) => q.isFetching || acc,
				false
			),
			isLoading: entryDataQueries.reduce((acc, q) => q.isLoading || acc, false),
			isError: entryDataQueries.reduce((acc, q) => q.isError || acc, false)
		}

		const timeRange = getDateRangeFromDisplaySettings(today, viewOptions)
		if (
			queryResults.isPending ||
			queryResults.isLoading ||
			queryResults.isError ||
			timeRange === undefined
		) {
			return {
				...queryResults,
				data: undefined
			}
		}

		let typeChecker: (value: Entry) => boolean
		switch (viewOptions.filter.type) {
			case "All":
				typeChecker = () => true
				break
			case "Expense":
				typeChecker = (value: Entry) => !value.is_positive
				break
			case "Income":
				typeChecker = (value: Entry) => value.is_positive
				break
		}

		const entryRangeIndicies = findBoundIndicies(
			queryResults.data.map((val) => new Date(val.date)),
			timeRange.from,
			timeRange.to,
			(a, b) => !a || !b || a < b || DateHelper.isDateEqual(a, b)
		)
		console.log(timeRange, entryRangeIndicies)

		const targetCategories = new Set(viewOptions.filter.categories)
		const combineResult = queryResults.data
			.slice(entryRangeIndicies[0], entryRangeIndicies[1] + 1)
			.filter(
				(value) =>
					(targetCategories.has(value.category) ||
						targetCategories.size == 0) &&
					typeChecker(value)
			)
			.toReversed()

		return { ...queryResults, data: combineResult }
	}, [today, entryDataQueries, viewOptions])
}

function useIsSmallMobile() {
	return useMediaQuery({ maxWidth: SMALL_MOBILE_BREKPOINT })
}

export {
	useAmountFormatter,
	useDashboardTransactionEntries,
	useIsSmallMobile,
	useSearchEntry,
	useSetElementWindowHeight
}
