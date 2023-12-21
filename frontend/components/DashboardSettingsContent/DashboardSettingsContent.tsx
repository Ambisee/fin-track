"use client"

import { useState } from "react"
import { useDashboardData } from "../DashboardDataProvider/DashboardDataProvider"

import styles from "./DashboardSettings.Content.module.css"
import TextField from "../FormField/TextField/TextField"
import ActionButton from "../ActionButton/ActionButton"

export default function DashboardSettingsContent() {
    const { user } = useDashboardData()
    const [username, setUsername] = useState(user.user_metadata.username)
    
    return (
        <div className={styles["container"]}>
            <h2 className={styles["page-title"]}>Settings</h2>
            <section className={styles["settings-field-section"]}>
                <h3 className={styles["field-title"]}>Username</h3>
                <p className={styles["field-desc"]}>
                    The identifier of the user. This value will be displayed
                    on the monthly report sent at the end of every month.
                </p>
                <div className={styles["input-element-container"]}>
                    <TextField 
                        variant="outlined"
                        showLabel={false}
                        placeholder={username}
                    />
                </div>
            </section>
            <ActionButton
                className={styles["save-settings-button"]}
            >
                Save Settings
            </ActionButton>
        </div>
    )
}