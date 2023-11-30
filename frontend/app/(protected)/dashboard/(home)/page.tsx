import { Metadata } from "next"

import styles from "./page.module.css"
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