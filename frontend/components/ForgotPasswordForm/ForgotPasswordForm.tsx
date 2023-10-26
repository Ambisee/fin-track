"use client"

import Link from "next/link"
import { useForm } from "react-hook-form"

import TextField from "../FormField/TextField/TextField"
import BaseFormWrapper from "../BaseFormWrapper/BaseFormWrapper"
import PortalButton from "../PortalButton/PortalButton"
import { sbClient } from "@/supabase/supabase_client"

import styles from "./ForgotPasswordForm.module.css"
import { LOGIN_PAGE_URL } from "@/helpers/url_routes"

export default function ForgotPasswordForm() {
    const { register, watch, handleSubmit, formState: { errors } } = useForm()
    
    const emailRegisterObject = register("email", {
        required: {
            value: true,
            message: "This field is required."
        }
    })

    return (
        <BaseFormWrapper>
            <form className={styles["form-element"]}>
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
                </div>
                <PortalButton
                    onClick={handleSubmit(
                        (data) => {
                            sbClient.auth.resetPasswordForEmail(data.email)
                                .then((value) => console.log(value))
                        },
                        (errors) => {
                            
                        }
                    )}
                >
                    Submit
                </PortalButton>
            </form>
        </BaseFormWrapper>
    )
}