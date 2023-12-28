import { Metadata } from "next";

import DashboardEntriesContent from "@/components/DashboardEntriesContent/DashboardEntriesContent";

import styles from "./page.module.css"

export const metadata: Metadata = {
    title: "FinTrack | Dashboard - Entries"
}

export default function DashboardEntries() {
    return (
        <div className={styles["wrapper"]}>
            <DashboardEntriesContent />
        </div>
    )
}