"use client"

import { useState } from "react"
import { useDashboardData } from "../DashboardDataProvider/DashboardDataProvider"
import { useForm } from "react-hook-form"

import TextField from "../FormField/TextField/TextField"
import PasswordField from "../FormField/PasswordField/PasswordField"
import ActionButton from "../ActionButton/ActionButton"
import Checkbox from "../Checkbox/Checkbox"
import { sbClient } from "@/supabase/supabase_client"

import styles from "./DashboardSettings.Content.module.css"

export default function DashboardSettingsContent() {
    const { user } = useDashboardData()
    const { register: registerForPassword } = useForm()
    
    return (
        <div className={styles["container"]}>
            <h1 className={styles["page-title"]}>Settings</h1>
            <section className={styles["settings-group"]}>
                <h2 className={styles["settings-group-title"]}>General</h2>
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
                            placeholder={user.user_metadata.username}
                        />
                    </div>
                </section>
            </section>
            <section className={styles["settings-group"]}>
                <h2 className={styles["settings-group-title"]}>Account Access</h2>
                <section className={styles["settings-field-section"]}>
                    <h3 className={styles["field-title"]}>Email</h3>
                    <p className={styles["field-desc"]}>
                    The email address that is linked to this account.
                    Changing email address requires the user to 
                    reauthenticate.
                    </p>
                    <div className={styles["input-element-container"]}>
                        <TextField 
                            variant="outlined"
                            showLabel={false}
                            placeholder={user.email}
                        />
                    </div>
                </section>
                <section className={styles["settings-field-section"]}>
                    <h3 className={styles["field-title"]}>Password</h3>
                    <p className={styles["field-desc"]}>
                        Send an email to the account&apos;s email address which contains steps to reset their password. 
                        If the account is created through an email provider,
                        The user can log in through both the email provider and through email and password.
                    </p>
                    <form>
                        <div className={styles["input-element-container"]}>
                            <PasswordField
                                {...registerForPassword("old-password")}
                                className={styles["input-element"]}
                                variant="outlined"
                                showToggler={false}
                                fieldDisplayName="Old password"
                            />
                        </div>
                        <div className={styles["input-element-container"]}>
                            <PasswordField
                                {...registerForPassword("new-password")}
                                className={styles["input-element"]}
                                variant="outlined"
                                showToggler={false}
                                fieldDisplayName="New password"
                            />
                        </div>
                        <div className={styles["input-element-container"]}>
                            <PasswordField
                                {...registerForPassword("confirm-new-password")}
                                className={styles["input-element"]}
                                variant="outlined"
                                showToggler={false}
                                fieldDisplayName="Confirm new password"
                            />
                        </div>
                        <ActionButton
                            className={styles["reset-password-button"]}
                        >
                            Submit
                        </ActionButton>
                    </form>
                </section>
            </section>
            <section className={styles["section-group"]}>
                <h2 className={styles["settings-group-title"]}>Notifications</h2>
                <section className={styles["settings-field-section"]}>
                    <h3 className={styles["field-title"]}>Monthly report</h3>
                    <p className={styles["field-desc"]}>
                        Authorize the application to send a monthly transaction report to
                        be sent to their email. Reports will be sent to the email specified on the
                        Account Access section. 
                    </p>
                    <div className={styles["monthly-report-cb-container"]}>
                        <Checkbox 
                            id="monthly-report-checkbox"
                        />
                        <label htmlFor="monthly-report-checkbox">
                            <b>Allow monthly report to be sent.</b>
                        </label>
                    </div>
                </section>
            </section>
            <ActionButton
                className={styles["save-settings-button"]}
            >
                Save Settings
            </ActionButton>
        </div>
    )
}