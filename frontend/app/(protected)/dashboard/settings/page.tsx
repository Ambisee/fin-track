import { Metadata } from "next"

import DashboardSettingsContent from "@/components/DashboardSettingsContent/DashboardSettingsContent"

import styles from "./page.module.css"

export const metadata: Metadata = {
    title: "FinTrack | Dashboard - Settings"
}

export default function DashboardSettings() {
    return (
        <div className={styles["wrapper"]}>
            <DashboardSettingsContent />
        </div>
    )
}