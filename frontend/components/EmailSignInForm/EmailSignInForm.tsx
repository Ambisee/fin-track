"use client"

import Link from "next/link"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"

import TextField from "../FormField/TextField/TextField"
import PasswordField from "../FormField/PasswordField/PasswordField"
import PortalButton from "../PortalButton/PortalButton"
import BaseFormWrapper from "../BaseFormWrapper/BaseFormWrapper"
import usePortalLoader from "@/hooks/usePortalLoader"
import { sbClient } from "@/supabase/supabase_client"
import { FORGOT_PASSWORD_PAGE_URL, REGISTRATION_PAGE_URL } from "@/helpers/url_routes"

import styles from "./EmailSignInForm.module.css"

export default function EmailSignInForm() {
    const router = useRouter() 
    const { setIsLoading } = usePortalLoader()
    const {register, watch, handleSubmit, formState: { errors }} = useForm()

    const emailRegisterObject = register("email", {
        required: {value: true, message: "This field is required."}
    })

    const passwordRegisterObject = register("password", {
        required: {value: true, message: "This field is required."}
    })

    return (
        <BaseFormWrapper title="Sign in with an email">
            <form 
                className={styles["form-element"]}
                onSubmit={(e) => {
                    e.preventDefault()
                    handleSubmit(
                        (data) => {
                            setIsLoading(true);
                            sbClient.auth.signInWithPassword({
                                email: data.email,
                                password: data.password,
                            }).then((value) => {
                                if (value.data?.user) {
                                    setIsLoading(false)
                                    router.push("/dashboard")
                                    return
                                }

                                if (value?.error) {
                                    alert(value?.error.message)
                                }
                            })
                        },
                        (errors) => {
                            console.log(errors)
                        }
                    )()
                    
                    return false;
                }}
            >
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
                    <Link href={FORGOT_PASSWORD_PAGE_URL} className={styles["forgot-password-link"]}>
                        Forgot your password? 
                    </Link>
                </div>
                <PortalButton 
                    className={styles['submit-button']}
                    type="submit"
                >
                    Login
                </PortalButton>
                <div className={styles["register-link-container"]}>
                    <span>
                        Don&apos;t have an account? <Link href={REGISTRATION_PAGE_URL} className={styles["register-link"]}>Create an account</Link>
                    </span>
                </div>
            </form>
        </BaseFormWrapper>
    )
}
