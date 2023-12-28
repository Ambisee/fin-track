"use client"

import { 
    Dispatch,
    ReactNode, 
    SetStateAction, 
    createContext, 
    useContext, 
    useEffect,
    useState 
} from "react"
import { PostgrestSingleResponse, RealtimePostgresChangesPayload, User } from "@supabase/supabase-js"
import { Entry } from "@/supabase"

import { sbClient } from "@/supabase/supabase_client"
import { handleDataChange } from "@/helpers/data_helper"

interface DashboardDataContextObject {
    user: User,
    data: Entry[],
    setUser: Dispatch<SetStateAction<User>>,
    setData: Dispatch<SetStateAction<Entry[]>>
}

interface DashboardDataProviderProps {
    children?: ReactNode,
    value: {
        user: User,
        data: PostgrestSingleResponse<any[]>
    }
}

const DashboardDataContext = createContext<DashboardDataContextObject>({} as DashboardDataContextObject)

export default function DashboardDataProvider(props: DashboardDataProviderProps) {
    const [user, setUser] = useState<User>(props.value.user)
    const [data, setData] = useState<Entry[]>(props.value.data.data as Entry[])

    useEffect(() => {
        const channel = sbClient
            .channel("data-channel")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "entry",
                    filter: `created_by=eq.${user.id}`
                },
                (payload: RealtimePostgresChangesPayload<Entry[]>) => {
                    setData(current => handleDataChange(current, payload))
                }
            )
            .subscribe()

        return () => {
            channel.unsubscribe()
        }
    }, [user.id])

    return (
        <DashboardDataContext.Provider value={{user, data, setUser, setData}}>
            {props.children}
        </DashboardDataContext.Provider>
    )
}

function useDashboardData() {
    return useContext(DashboardDataContext)
}

export { useDashboardData }
export type { DashboardDataProviderProps, DashboardDataContextObject }
