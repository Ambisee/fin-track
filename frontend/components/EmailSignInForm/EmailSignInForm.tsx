"use client"

import { useForm } from "react-hook-form"
import { ErrorMessage } from "@hookform/error-message"

import TextField from "../FormField/TextField/TextField"
import PasswordField from "../FormField/PasswordField/PasswordField"
import PortalButton from "../PortalButton/PortalButton"

import styles from "./EmailSignInForm.module.css"
import Link from "next/link"
import BaseFormWrapper from "../BaseFormWrapper/BaseFormWrapper"

export default function EmailSignInForm() {
    const {register, watch, formState: { errors }} = useForm()

    const emailRegisterObject = register("email", {
        required: {value: true, message: "This field is required."}
    })
    const passwordRegisterObject = register("password", {
        required: {value: true, message: "This field is required."}
    })

    return (
        <BaseFormWrapper title="Sign in with an email">
            <form className={styles["form-element"]}>
                <div className={styles["input-field-wrapper"]}>
                    <TextField 
                        fieldDisplayName="Email" 
                        className={styles["input-field"]}
                        registerObject={emailRegisterObject}
                        watchedValue={watch("email")}
                    />
                </div>
                <div className={styles["input-field-wrapper"]}>
                    <PasswordField
                        fieldDisplayName="Password"
                        className={styles["input-field"]}
                        registerObject={passwordRegisterObject}
                        watchedValue={watch("password")}
                    />
                </div>
                <div className={styles["forgot-password-link-container"]}>
                    <Link href="/forgot-passsword" className={styles["forgot-password-link"]}>
                        Forgot your password? 
                    </Link>
                </div>
                <PortalButton className={styles['submit-button']}>
                    Login
                </PortalButton>
                <div className={styles["register-link-container"]}>
                    <span>
                        Don&apos;t have an account? <Link href="/registration" className={styles["register-link"]}>Create an account</Link>
                    </span>
                </div>
                <ErrorMessage
                    errors={errors}
                    name="multipleErrorInput"
                    render={({ messages }) =>
                        messages &&
                            Object.entries(messages).map(([type, message]) => (
                                <p key={type}>{message}</p>
                            ))
                    }
                />
            </form>
        </BaseFormWrapper>
    )
}