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
            <h2 className={styles["welcome-text"]}>Welcome back, {user?.user_metadata.username}.</h2>
            <div className={styles["action-button-container"]}>
                <ActionButton 
                    className={styles["action-button"]}
                    onClick={() => setIsEntryFormToggled(true)}
                >
                    Add a new entry
                </ActionButton>
            </div>
        </>
    )
}
