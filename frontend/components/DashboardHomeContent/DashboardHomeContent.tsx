"use client"

import { useDashboardData } from "../DashboardDataProvider/DashboardDataProvider"
import PortalButton from "../PortalButton/PortalButton"

import styles from "./DashboardHomeContent.module.css"

export default function DashboardHomeContent() {
    const { user, data } = useDashboardData()
    
    return (
        <>
            <div>
                <h2 className={styles["welcome-text"]}>Welcome back, {user?.user_metadata.username}.</h2>
            </div>
        </>
    )
}
