"use client"

import ActionButton from "../ActionButton/ActionButton"
import EntryList from "../EntryList/EntryList"
import { useLayout } from "../ProtectedLayoutProvider/ProtectedLayoutProvider"
import { useDashboardData } from "../DashboardDataProvider/DashboardDataProvider"

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
            <div className={styles["recent-entry-container"]}>
                <span className={styles["recent-entry-title"]}>
                    Recent entries
                </span>
                <EntryList data={data} />
            </div>
        </>
    )
}
