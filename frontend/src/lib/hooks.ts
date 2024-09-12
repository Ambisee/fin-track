import { UserResponse } from "@supabase/supabase-js";
import { UndefinedInitialDataOptions, useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { CATEGORIES_QKEY, CURRENCIES_QKEY, ENTRY_QKEY, USER_QKEY, USER_SETTINGS_QKEY } from "./constants";
import { sbBrowser } from "./supabase";

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

function useUserQuery(options?: UndefinedInitialDataOptions<UserResponse, Error, UserResponse, string[]>) {
    return useQuery({
        queryKey: USER_QKEY,
        queryFn: () => sbBrowser.auth.getUser(),
        refetchOnWindowFocus: false,
        refetchOnMount: (query) => query.state.data === undefined,
        ...options
    })
}

function useEntryDataQuery() {
    const userQuery = useUserQuery()
    return useQuery({
		queryKey: ENTRY_QKEY,
		queryFn: async () =>
			sbBrowser
				.from("entry")
				.select("*")
				.eq("created_by", userQuery?.data?.data.user?.id as string)
				.order("date", { ascending: false })
				.limit(100),
		refetchOnWindowFocus: false,
		refetchOnMount: (query) => query.state.data === undefined,
		enabled: !!userQuery.data
	})
}

function useSettingsQuery() {
    const userQuery = useUserQuery()
    return useQuery({
		queryKey: USER_SETTINGS_QKEY,
		queryFn: async () =>
			await sbBrowser
				.from("settings")
				.select(`*, currencies (currency_name)`)
                .eq("user_id", userQuery.data?.data.user?.id as string)
				.limit(1)
				.single(),
		refetchOnWindowFocus: false,
		refetchOnMount: (query) => query.state.data === undefined,
        enabled: !!userQuery.data
	})
}

function useCurrenciesQuery() {
    return useQuery({
        queryKey: CURRENCIES_QKEY,
        queryFn: async () => await sbBrowser.from("currencies").select("*"),
        refetchOnWindowFocus: false,
		refetchOnMount: (query) => query.state.data === undefined
    })
}

function useCategoriesQuery() {
    const userData = useUserQuery()
    
    return useQuery({
		queryKey: CATEGORIES_QKEY,
		queryFn: async () => {
			return await sbBrowser.rpc("fetch_categories", {
				user_id: userData?.data?.data.user?.id as string
			})
		},
		enabled: !!userData
	})
}

export { useCategoriesQuery, useCurrenciesQuery, useEntryDataQuery, useSetElementWindowHeight, useSettingsQuery, useUserQuery };
