"use client"

import { ReactNode, createContext, useContext } from "react"
import { PostgrestSingleResponse, User } from "@supabase/supabase-js"
import { sbClient } from "@/supabase/supabase_client"

interface DashboardDataContextObject {
    user: User | null,
    data: PostgrestSingleResponse<any[]>
}

interface DashboardDataProviderProps {
    children?: ReactNode,
    value: DashboardDataContextObject
}

const DashboardDataContext = createContext<DashboardDataContextObject>({} as DashboardDataContextObject)

export default function DashboardDataProvider(props: DashboardDataProviderProps) {
    return (
        <DashboardDataContext.Provider value={props.value}>
            {props.children}
        </DashboardDataContext.Provider>
    )
}

function useDashboardData() {
    return useContext(DashboardDataContext)
}

export { useDashboardData }
export type { DashboardDataContextObject }
