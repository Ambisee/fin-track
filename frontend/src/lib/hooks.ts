import { EntryFormData } from "@/components/user/EntryForm/EntryForm"
import { Category, Entry, Ledger } from "@/types/supabase"
import { UserResponse } from "@supabase/supabase-js"
import {
	UndefinedInitialDataOptions,
	useMutation,
	useQuery
} from "@tanstack/react-query"
import { useCallback, useEffect, useRef } from "react"
import {
	CATEGORIES_QKEY,
	CURRENCIES_QKEY,
	ENTRY_QKEY,
	LEDGER_QKEY,
	MONTH_GROUP_QKEY,
	USER_QKEY,
	USER_SETTINGS_QKEY
} from "./constants"
import { sbBrowser } from "./supabase"

function useUserQuery(
	options?: UndefinedInitialDataOptions<
		UserResponse,
		Error,
		UserResponse,
		string[]
	>
) {
	return useQuery({
		queryKey: USER_QKEY,
		queryFn: () => sbBrowser.auth.getUser(),
		refetchOnWindowFocus: false,
		refetchOnMount: (query) =>
			query.state.data?.data.user === undefined ||
			query.state.data.data.user === null,
		...options
	})
}

function useEntryDataQuery() {
	const userQuery = useUserQuery()
	const settingsQuery = useSettingsQuery()

	return useQuery({
		queryKey: ENTRY_QKEY,
		queryFn: async () =>
			await sbBrowser
				.from("entry")
				.select(`*`)
				.eq("created_by", userQuery?.data?.data.user?.id as string)
				.eq("ledger", settingsQuery.data?.data?.current_ledger as number)
				.order("date")
				.order("category")
				.limit(100),
		refetchOnWindowFocus: false,
		refetchOnMount: (query) => query.state.data === undefined,
		enabled:
			!!userQuery.data?.data.user &&
			!!settingsQuery.data?.data &&
			!userQuery.isRefetching &&
			!settingsQuery.isRefetching
	})
}

function useSettingsQuery() {
	const userQuery = useUserQuery()
	return useQuery({
		queryKey: USER_SETTINGS_QKEY,
		queryFn: async () =>
			await sbBrowser
				.from("settings")
				.select(`*, ledger (*, currency (currency_name))`)
				.eq("user_id", userQuery.data?.data.user?.id as string)
				.limit(1)
				.single(),
		refetchOnWindowFocus: false,
		refetchOnMount: (query) =>
			query.state.data === undefined || query.state.data.data === null,
		enabled: !!userQuery.data && !userQuery.isRefetching
	})
}

function useCurrenciesQuery() {
	return useQuery({
		queryKey: CURRENCIES_QKEY,
		queryFn: async () => await sbBrowser.from("currency").select("*"),
		refetchOnWindowFocus: false,
		refetchOnMount: (query) => query.state.data === undefined
	})
}

function useCategoriesQuery() {
	const userQuery = useUserQuery()

	return useQuery({
		queryKey: CATEGORIES_QKEY,
		queryFn: async () => {
			const userId = userQuery.data?.data.user?.id
			if (!userId) {
				return await sbBrowser
					.from("category")
					.select("*")
					.eq("created_by", "false")
			}

			return await sbBrowser
				.from("category")
				.select("*")
				.eq("created_by", userId)
				.order("name")
		},
		refetchOnWindowFocus: false,
		refetchOnMount: (query) => !!query.state.data,
		enabled: !!userQuery.data?.data.user && !userQuery.isRefetching
	})
}

function useLedgersQuery() {
	const userQuery = useUserQuery()

	return useQuery({
		queryKey: LEDGER_QKEY,
		queryFn: async () => {
			const userId = userQuery.data?.data.user?.id
			if (!userId) {
				return await sbBrowser
					.from("ledger")
					.select("*, currency (currency_name), entry(count)")
					.eq("id", -1)
			}

			return await sbBrowser
				.from("ledger")
				.select("*, currency (currency_name), entry(count)")
				.eq("created_by", userId)
				.order("name")
		},
		refetchOnWindowFocus: false,
		refetchOnMount: (query) => !!query.state.data,
		enabled: !!userQuery.data?.data.user && !userQuery.isRefetching
	})
}

function useMonthGroupQuery(ledger_id?: number) {
	const userQuery = useUserQuery()

	return useQuery({
		queryKey: [MONTH_GROUP_QKEY, ledger_id],
		queryFn: async () => {
			return await sbBrowser
				.from("month_groups")
				.select("*")
				.eq("created_by", userQuery.data?.data.user?.id as string)
				.eq("ledger_id", ledger_id as number)
				.order("year, month", { ascending: true })
		},
		refetchOnWindowFocus: false,
		enabled:
			!!userQuery.data?.data.user &&
			!userQuery.isRefetching &&
			ledger_id !== undefined
	})
}

function useInsertEntryMutation() {
	const userQuery = useUserQuery()

	return useMutation({
		mutationFn: async (entry: EntryFormData) => {
			const userData = userQuery.data?.data.user
			if (!userData) {
				throw Error("An unexpected error occured: No user data")
			}

			const isPositive = entry.type === "Income"
			let note: string | null = entry.note
			if (note === "") {
				note = null
			}

			const { data, error } = await sbBrowser
				.from("entry")
				.insert({
					date: entry.date.toLocaleDateString(),
					category: entry.category,
					created_by: userData.id,
					is_positive: isPositive,
					amount: Number(entry.amount),
					note: note,
					ledger: entry.ledger
				})
				.select()
				.single()

			if (error !== null) {
				throw Error("Unable to create the entry", { cause: error })
			}

			return data
		}
	})
}

function useDeleteEntryMutation() {
	const userQuery = useUserQuery()

	return useMutation({
		mutationFn: async (id: number) => {
			const userData = userQuery.data?.data.user
			if (!userData) {
				throw Error("An unexpected error occured: No user data")
			}

			const { data, error } = await sbBrowser
				.from("entry")
				.delete()
				.eq("created_by", userData.id)
				.eq("id", id)
                .select("*")
                .single()

            if (error !== null) {
                throw Error("Unable to delete the entry", {cause: error})
            }

            return data
		}
	})
}

function useUpdateEntryMutation() {
    const userQuery = useUserQuery()

    return useMutation({
        mutationFn: async (entry: EntryFormData & {id: number}) => {
			const isPositive = entry.type === "Income"

			let note: string | null = entry.note
			if (note === "") {
				note = null
			}

			const {data, error} = await sbBrowser
                .from("entry")
                .update({
                    date: entry.date.toDateString(),
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
                throw Error("Unable to update the entry", {cause: error})
            }

            return data
		}
    })
}

function useInsertLedgerMutation() {
	const userQuery = useUserQuery()

	return useMutation({
		mutationKey: LEDGER_QKEY,
		mutationFn: async (
			data: Pick<Ledger, "created_by" | "name" | "currency_id">
		) => {
			if (!userQuery.data?.data || !userQuery.data.data.user) {
				throw Error("An unexpected error occured: No user data")
			}

			const { data: result, error } = await sbBrowser
				.from("ledger")
				.insert({
					created_by: userQuery.data.data.user.id,
					name: data.name,
					currency_id: data.currency_id
				})
				.select("*, currency (currency_name), entry(count)")
				.single()

			if (error) {
				throw Error("Unable to create the new ledger", { cause: error })
			}

			return result
		}
	})
}

function useUpdateLedgerMutation() {
	const userQuery = useUserQuery()

	return useMutation({
		mutationKey: LEDGER_QKEY,
		mutationFn: async (
			data: Pick<Ledger, "id" | "created_by" | "name" | "currency_id">
		) => {
			if (!userQuery.data?.data?.user || !data) {
				throw Error("An unexpected error occured: No user data")
			}

			const { data: result, error } = await sbBrowser
				.from("ledger")
				.update({ name: data.name, currency_id: data.currency_id })
				.eq("id", data.id)
				.eq("created_by", data.created_by)
				.select("*, currency (currency_name), entry(count)")
				.single()

			if (error != null) {
				throw Error("Unable to update the ledger", { cause: error })
			}

			return result
		}
	})
}

function useDeleteLedgerMutation() {
	const ledgersQuery = useLedgersQuery()

	return useMutation({
		mutationKey: LEDGER_QKEY,
		mutationFn: async (data: { id: number }) => {
			const ledgersCount = ledgersQuery.data?.data?.length
			if (!ledgersCount) {
				throw Error("An unexpected error occured: No ledger data")
			}

			if (ledgersCount < 2) {
				throw Error(
					"Unable to delete the ledger. User must have at least one ledger"
				)
			}

			const { data: result, error } = await sbBrowser
				.from("ledger")
				.delete()
				.eq("id", data.id)
				.select("*, currency (currency_name), entry(count)")
				.single()

			if (error) {
				throw Error("Unable to delete the ledger", { cause: error })
			}

			return result
		}
	})
}

function useSwitchLedgerMutation() {
	const userQuery = useUserQuery()

	return useMutation({
		mutationKey: USER_SETTINGS_QKEY,
		mutationFn: async (data: { id: number }) => {
			if (userQuery.data?.data.user?.id === undefined) {
				return undefined
			}

			const { data: result, error } = await sbBrowser
				.from("settings")
				.update({ current_ledger: data.id })
				.eq("user_id", userQuery.data?.data.user.id as string)
				.select("*, ledger (name)")
				.single()

			if (error) {
				throw Error("Unable to switch ledger", { cause: error })
			}

			return result
		}
	})
}

function useInsertCategoryMutation() {
	const userQuery = useUserQuery()

	return useMutation({
		mutationKey: CATEGORIES_QKEY,
		mutationFn: async (category: Category) => {
			if (userQuery.data?.data.user?.id === undefined) {
				return
			}

			const { data, error } = await sbBrowser
				.from("category")
				.insert({
					created_by: userQuery.data.data.user.id,
					name: category.name
				})
				.select("*")
				.single()

			if (error !== null) {
				throw Error("Unable to create the category", { cause: error })
			}

			return data
		}
	})
}

function useUpdateCategoryMutation() {
	const userQuery = useUserQuery()

	return useMutation({
		mutationKey: CATEGORIES_QKEY,
		mutationFn: async (category: Category & { oldName: string }) => {
			const userData = userQuery.data?.data.user
			if (!userData) {
				throw Error("An unexpected error occured: No user data")
			}

			const { data, error } = await sbBrowser
				.from("category")
				.update({
					name: category.name
				})
				.eq("name", category.oldName)
				.eq("created_by", userData.id)
				.select("*")
				.single()

			if (error !== null) {
				throw Error("Unable to update the category", { cause: error })
			}

			return data
		}
	})
}

function useDeleteCategoryMutation() {
	const userQuery = useUserQuery()

	return useMutation({
		mutationKey: CATEGORIES_QKEY,
		mutationFn: async (category: Category) => {
			const userData = userQuery.data?.data.user
			if (!userData) {
				return
			}

			const { data, error } = await sbBrowser
				.from("category")
				.delete()
				.eq("created_by", category.created_by)
				.eq("name", category.name)
				.select()

			if (error !== null) {
				throw Error("Unable to delete the category", { cause: error })
			}

			return data
		}
	})
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
			const currency =
				userSettingsQuery?.data?.data?.ledger?.currency?.currency_name
			if (num === undefined || currency === undefined || currency === null) {
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
	useInsertEntryMutation,
    useDeleteEntryMutation,
    useUpdateEntryMutation,
	useDeleteCategoryMutation,
	useDeleteLedgerMutation,
	useEntryDataQuery,
	useInsertCategoryMutation,
	useInsertLedgerMutation,
	useLedgersQuery,
	useMonthGroupQuery,
	useSetElementWindowHeight,
	useSettingsQuery,
	useSwitchLedgerMutation,
	useUpdateCategoryMutation,
	useUpdateLedgerMutation,
	useUserQuery
}
