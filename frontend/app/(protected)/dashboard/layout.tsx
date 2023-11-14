import { ReactNode } from "react"
import { User } from "@supabase/auth-helpers-nextjs"

import ProtectedNavbar from "@/components/ProtectedNavbar/ProtectedNavbar"
import ProtectedLayout from "@/components/ProtectedLayout/ProtectedLayout"
import { sbServer } from "@/supabase/supabase_server"
import ProtectedLayoutProvider from "@/components/ProtectedLayoutProvider/ProtectedLayoutProvider"

interface DashboardLayoutProps {
    children?: ReactNode
}

export default async function DashboardLayout(props: DashboardLayoutProps) {
    const user = (await sbServer.auth.getUser()).data.user as User
    const data = (await sbServer.from("entry").select("*").eq("created_by", user.id))

    const layoutContextValue = { user, data }

    return (
        <ProtectedLayoutProvider>
            <ProtectedLayout contextValue={layoutContextValue}>
                {props.children}
            </ProtectedLayout>
        </ProtectedLayoutProvider>
    )
}