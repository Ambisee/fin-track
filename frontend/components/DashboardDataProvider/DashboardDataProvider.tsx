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
        const dataChannel = sbClient
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

        const userInfoChannel = sbClient.auth.onAuthStateChange((e) => {
            if (e === "USER_UPDATED") {
                console.log("D")
                sbClient.auth.getUser()
                    .then((value) => {
                        if (value.error) {
                            alert(value.error.message)
                            return
                        }
        
                        setUser(value.data.user)
                    })
            }
        })

        return () => {
            dataChannel.unsubscribe()
            userInfoChannel.data.subscription.unsubscribe()
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
