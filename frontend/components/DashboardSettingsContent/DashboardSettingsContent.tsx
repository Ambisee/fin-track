"use client"

import { useEffect, useState } from "react"
import { useDashboardData } from "../DashboardDataProvider/DashboardDataProvider"
import { useForm } from "react-hook-form"

import TextField from "../FormField/TextField/TextField"
import PasswordField from "../FormField/PasswordField/PasswordField"
import ActionButton from "../ActionButton/ActionButton"
import Checkbox from "../Checkbox/Checkbox"
import { sbClient } from "@/supabase/supabase_client"

import styles from "./DashboardSettings.Content.module.css"
import { User } from "@supabase/supabase-js"
import { ONLY_ALPHANUMERIC } from "@/helpers/input_validation"

interface DashboardSettingsContentProps {
    prefetchedUser: User
}

export default function DashboardSettingsContent({
    prefetchedUser
}: DashboardSettingsContentProps) {
    const { user, setUser } = useDashboardData()
    const { register, watch, handleSubmit } = useForm({
        defaultValues: {
            'general': {
                'username': ''
            },
            'account-access': {
                'new-email': ''
            },
            'notifications': {
                'allow-report': prefetchedUser.user_metadata.allow_report ?? false
            }
        }
    })
    
    return (
        <>
            <h1 className={styles["page-title"]}>Settings</h1>
            <section className={styles["settings-group"]}>
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        handleSubmit(
                            async (data) => {
                                if (data?.["general"]?.["username"] === undefined) {
                                    alert("Username is not specified")
                                    return
                                }

                                const { error } = await sbClient.auth.updateUser({
                                    data: {
                                        username: data["general"]["username"]
                                    }
                                })

                                if (error !== null) {
                                    alert(`An error occured: ${error.message}.`)
                                    return
                                }

                                alert("Successfully updated the user's settings.")
                            },
                            async (errors) => {
                                if (errors["general"] === undefined) {
                                    return
                                }

                                alert(`An error occured: ${errors["general"]["username"]?.message}`)
                            }
                        )()
                    }}
                >
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
                                registerObject={register("general.username", {
                                    pattern: {
                                        value: ONLY_ALPHANUMERIC,
                                        message: "Usernames can only have alphabets and numbers."
                                    }
                                })}
                            />
                        </div>
                    </section>
                    <ActionButton 
                        className={styles["save-settings-button"]}
                    >
                        Save settings
                    </ActionButton>
                </form>
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
                        <form onSubmit={(e) => {
                            e.preventDefault()
                            handleSubmit(
                                async (data) => {
                                    const old_email = user.email

                                    const {error} = await sbClient.auth.updateUser({
                                        email: data["account-access"]["new-email"]
                                    })
                                    
                                    if (error !== null) {
                                        alert(`An error occured: ${error.message}`)
                                        return
                                    }

                                    alert(
                                        `An email change has been requested. ` +
                                        `An email has been sent to ${data["account-access"]["new-email"]} and ${user.email}. ` +
                                        `Please check both inboxes and click on the links to complete the change.`
                                    )
                                }

                            )()
                        }}>
                            <TextField 
                                variant="outlined"
                                showLabel={false}
                                placeholder={user.email}
                                registerObject={register("account-access.new-email")}
                            />
                            <ActionButton
                                className={styles["save-settings-button"]}

                            >
                                Save settings
                            </ActionButton>
                        </form>
                    </div>
                </section>
                <section className={styles["settings-field-section"]}>
                    <h3 className={styles["field-title"]}>Password</h3>
                    <p className={styles["field-desc"]}>
                        Send an email to the account&apos;s email address which contains steps to reset their password. 
                        If the account is created through an email provider,
                        The user can log in through both the email provider and through email and password.
                    </p>
                    <ActionButton
                        className={styles["save-settings-button"]}
                        onClick={async (e) => {
                            if (user.email === undefined) {
                                alert("No user signed in.")
                                return
                            }

                            const {data, error} = await sbClient.auth.resetPasswordForEmail(user.email, {
                                redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/settings`
                            })

                            if (error !== null) {
                                alert(`An error occured: ${error.message}`)
                                return
                            }

                            alert(
                                "Check your inbox at " +
                                `${user.email} for further instruction ` +
                                "on how to reset your password."
                            )
                        }}
                    >
                        Reset password
                    </ActionButton>
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
                            checked={watch('notifications.allow-report')}
                            {...register("notifications.allow-report")}
                        />
                        <label htmlFor="monthly-report-checkbox">
                            <b>Allow monthly report to be sent.</b>
                        </label>
                    </div>
                </section>
            </section>
            <ActionButton
                className={styles["save-settings-button"]}
                onClick={(e) => {
                    handleSubmit(async (data) => {
                        const {error} = await sbClient.auth.updateUser({
                            data: {allow_report: data["notifications"]["allow-report"]}
                        })

                        if (error) {
                            alert(`An error occured: ${error.message}`)
                            return
                        }

                        alert("Successfully updated the user's settings.")
                    })()
                }}
            >
                Save Settings
            </ActionButton>
        </>
    )
}