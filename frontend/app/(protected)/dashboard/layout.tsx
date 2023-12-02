import { ReactNode } from "react"
import { notFound } from "next/navigation"
import { User } from "@supabase/auth-helpers-nextjs"

import ProtectedNavbar from "@/components/ProtectedNavbar/ProtectedNavbar"
import ProtectedLayout from "@/components/ProtectedLayout/ProtectedLayout"
import { sbServer } from "@/supabase/supabase_server"
import ProtectedLayoutProvider from "@/components/ProtectedLayoutProvider/ProtectedLayoutProvider"
import { cookies } from "next/headers"

interface DashboardLayoutProps {
    children?: ReactNode
}

export default async function DashboardLayout(props: DashboardLayoutProps) {
    const cookieStore = cookies()
    const { user } = (await sbServer(cookieStore).auth.getUser()).data
    const data = await sbServer(cookieStore)
        .from("entry")
        .select("*")
        .order("date", {ascending: false})
        .limit(1000)

    if ((user === null) || (data === null)) {
        return notFound()
    }

    const layoutContextValue = { user, data }

    return (
        <ProtectedLayoutProvider>
            <ProtectedLayout contextValue={layoutContextValue}>
                {props.children}
            </ProtectedLayout>
        </ProtectedLayoutProvider>
    )
}