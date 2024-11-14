import { UserResponse } from "@supabase/supabase-js";
import { UndefinedInitialDataOptions, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { CATEGORIES_QKEY, CURRENCIES_QKEY, ENTRY_QKEY, LEDGER_QKEY, USER_QKEY, USER_SETTINGS_QKEY } from "./constants";
import { sbBrowser } from "./supabase";

function useUserQuery(options?: UndefinedInitialDataOptions<UserResponse, Error, UserResponse, string[]>) {
    return useQuery({
        queryKey: USER_QKEY,
        queryFn: () => sbBrowser.auth.getUser(),
        refetchOnWindowFocus: false,
        refetchOnMount: (query) => query.state.data?.data.user === undefined || query.state.data.data.user === null,
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
		enabled: !!userQuery.data?.data.user && !!settingsQuery.data?.data
	})
}

function useSettingsQuery() {
    const userQuery = useUserQuery()
    return useQuery({
		queryKey: USER_SETTINGS_QKEY,
		queryFn: async () =>
			await sbBrowser
				.from("settings")
				.select(`*, currency (currency_name), ledger (*, currency (currency_name))`)
                .eq("user_id", userQuery.data?.data.user?.id as string)
				.limit(1)
				.single(),
		refetchOnWindowFocus: false,
		refetchOnMount: (query) => query.state.data === undefined || query.state.data.data === null,
        enabled: !!userQuery.data
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
    const userData = useUserQuery()
    
    return useQuery({
		queryKey: CATEGORIES_QKEY,
		queryFn: async () => {
            const userId = userData.data?.data.user?.id
            if (!userId) {
                return await sbBrowser.from("category").select("*").eq("id", -1).order("id")
            }

            return await sbBrowser
                .from("category")
                .select("*")
                .eq('created_by', userId)
                .order('name')
        },
		enabled: !!userData
    })
}

function useLedgersQuery() {
    const userData = useUserQuery()
    
    return useQuery({
        queryKey: LEDGER_QKEY,
        queryFn: async () => {
            const userId = userData.data?.data.user?.id
            if (!userId) {
                return await sbBrowser.from("ledger").select("*").eq("id", -1)
            }

            return await sbBrowser
                .from("ledger")
                .select("*")
                .eq('created_by', userId)
                .order('name')
        },
        enabled: !!userData
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

    const formatAmount = useCallback((num?: number) => {
		const currency = userSettingsQuery?.data?.data?.ledger?.currency?.currency_name
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
	}, [userSettingsQuery])

    return formatAmount
}

export { 
    useCategoriesQuery, useCurrenciesQuery, useEntryDataQuery, useSettingsQuery, useUserQuery, useLedgersQuery,
    useSetElementWindowHeight, useAmountFormatter
};

