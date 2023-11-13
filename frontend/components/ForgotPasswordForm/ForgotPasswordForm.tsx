"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"

import TextField from "../FormField/TextField/TextField"
import BaseFormWrapper from "../BaseFormWrapper/BaseFormWrapper"
import PortalButton from "../PortalButton/PortalButton"
import usePortalLoader from "@/hooks/usePortalLoader"
import RecoveryForm from "../RecoveryForm/RecoveryForm"
import { sbClient } from "@/supabase/supabase_client"
import { IS_EMAIL_REGEX } from "@/helpers/input_validation"

import styles from "./ForgotPasswordForm.module.css"

export default function ForgotPasswordForm() {
    const [showResetPassword, setShowResetPassword] = useState(false)
    const { setIsLoading } = usePortalLoader()
    const { register, watch, handleSubmit, formState: { errors } } = useForm({
        mode: "onChange"
    })

    const emailRegisterObject = register("email", {
        required: {
            value: true,
            message: "This field is required."
        },
        pattern: {
            value: IS_EMAIL_REGEX,
            message: "Please provide a valid email address."
        }
    })

    if (showResetPassword) {
        return (
            <BaseFormWrapper>
                <RecoveryForm />
            </BaseFormWrapper>
        )
    }

    return (
        <BaseFormWrapper>
            <form 
                className={styles["form-element"]}
                onSubmit={(e) => {
                    e.preventDefault()
                    handleSubmit(
                        (data) => {
                            setIsLoading(true)
                            sbClient.auth.resetPasswordForEmail(
                                data.email,
                                {
                                    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/forgot-password`
                                }
                            )
                                .then((value) => {
                                    setIsLoading(false)
                                    if (value?.error) {
                                        alert(value.error.message)
                                        return;
                                    }

                                    alert(
                                        "Check your inbox at " +
                                        `${data.email} for further instruction ` +
                                        "on how to reset your password."
                                    )
                                })
                        },
                        (errors) => {
                            
                        }
                    )()

                    return false;
                }}
            >
                <p className={styles["form-description"]}>
                    By submitting this form, an email will be sent to the inbox of the email address
                    specified (if the email address links to a valid account). Please check the email
                    for instructions on how to reset your password.
                </p>
                <div className={styles["input-field"]}>
                    <TextField 
                        registerObject={emailRegisterObject}
                        watchedValue={watch("email")}
                        fieldDisplayName="Email"
                    />
                    <div 
                        className={`
                            ${styles["error-text-color"]}
                            ${styles["error-text-font"]}
                            ${styles["error-text-pos-absolute"]}
                            ${errors.email === undefined ? styles["hide-error"] : ""}
                        `}
                    >
                        {(errors?.email !== undefined) ? errors.email.message as string : ""}
                    </div>
                </div>
                <PortalButton
                    type="submit"
                >
                    Submit
                </PortalButton>
            </form>
        </BaseFormWrapper>
    )
}