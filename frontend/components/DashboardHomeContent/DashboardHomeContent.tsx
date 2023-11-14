"use client"

import { useDashboardData } from "../DashboardDataProvider/DashboardDataProvider"
import ActionButton from "../ActionButton/ActionButton"
import { useLayout } from "../ProtectedLayoutProvider/ProtectedLayoutProvider"

import styles from "./DashboardHomeContent.module.css"

export default function DashboardHomeContent() {
    const { user, data } = useDashboardData()
    const { setIsEntryFormToggled } = useLayout()
    
    return (
        <>
            <div className={styles["page-intro-container"]}>
                <h2 className={styles["welcome-text"]}>Welcome back, {user?.user_metadata.username}.</h2>
                <ActionButton 
                    className={styles["new-entry-button"]}
                    onClick={() => setIsEntryFormToggled(true)}
                >
                    Add a new entry
                </ActionButton>
            </div>
        </>
    )
}
