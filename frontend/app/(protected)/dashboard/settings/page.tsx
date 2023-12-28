import { Metadata } from "next"
import { cookies } from "next/headers"

import DashboardSettingsContent from "@/components/DashboardSettingsContent/DashboardSettingsContent"

import styles from "./page.module.css"
import { sbServer } from "@/supabase/supabase_server"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
    title: "FinTrack | Dashboard - Settings"
}

export default async function DashboardSettings() {
    const supabase = sbServer(cookies())
    const { data: { user } } = await supabase.auth.getUser()

    if (user === null) {
        return redirect("/")
    }

    return (
        <div className={styles["wrapper"]}>
            <DashboardSettingsContent prefetchedUser={user} />
        </div>
    )
}