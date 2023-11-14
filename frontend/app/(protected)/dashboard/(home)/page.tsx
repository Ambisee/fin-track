import { Metadata } from "next"

import EntryForm from "@/components/EntryForm/EntryForm"
import { sbServer } from "@/supabase/supabase_server"

import styles from "./page.module.css"
import EntryList from "@/components/EntryList/EntryList"
import DashboardHomeContent from "@/components/DashboardHomeContent/DashboardHomeContent"

export const metadata: Metadata = {
    title: "FinTrack | Dashboard"
}

export default async function DashboardHome() {
    return (
        <div className={styles["wrapper"]}>
            <DashboardHomeContent />
        </div>
    )
}