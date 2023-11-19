import { ReactNode } from "react"
import { notFound } from "next/navigation"
import { User } from "@supabase/auth-helpers-nextjs"

import ProtectedNavbar from "@/components/ProtectedNavbar/ProtectedNavbar"
import ProtectedLayout from "@/components/ProtectedLayout/ProtectedLayout"
import { sbServer } from "@/supabase/supabase_server"
import ProtectedLayoutProvider from "@/components/ProtectedLayoutProvider/ProtectedLayoutProvider"

interface DashboardLayoutProps {
    children?: ReactNode
}

export default async function DashboardLayout(props: DashboardLayoutProps) {
    const { user } = (await sbServer.auth.getUser()).data
    const data = (await sbServer.from("entry").select("*").order("date", {ascending: false}))

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