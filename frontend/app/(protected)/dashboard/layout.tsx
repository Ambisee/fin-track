import { ReactNode } from "react"
import { cookies } from "next/headers"
import { User, createServerComponentClient } from "@supabase/auth-helpers-nextjs"

import ProtectedNavbar from "@/components/ProtectedNavbar/ProtectedNavbar"
import ProtectedLayout from "@/components/ProtectedLayout/ProtectedLayout"
import { sbKey, sbURL } from "@/supabase/constants"

interface DashboardLayoutProps {
    children?: ReactNode
}

export default async function DashboardLayout(props: DashboardLayoutProps) {
    const sbServer = createServerComponentClient( {cookies: cookies}, {
        supabaseKey: sbKey,
        supabaseUrl: sbURL
    })

    const user = (await sbServer.auth.getUser()).data.user as User
    const data = (await sbServer.from("entry").select("*").eq("created_by", user.id))

    const layoutContextValue = { user, data }

    return (
        <ProtectedLayout contextValue={layoutContextValue}>
            {props.children}
        </ProtectedLayout>
    )
}