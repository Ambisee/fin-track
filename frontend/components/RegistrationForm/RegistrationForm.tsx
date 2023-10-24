"use client"

import Link from "next/link"
import { useForm } from "react-hook-form"

import TextField from "../FormField/TextField/TextField"
import PasswordField from "../FormField/PasswordField/PasswordField"
import BaseFormWrapper from "../BaseFormWrapper/BaseFormWrapper"
import { sbClient } from "@/supabase/supabase_client"
import { 
    IS_EMAIL_REGEX,
    hasDigit,
    hasLowerCase,
    hasUpperCase,
    isConditionFulfilled
} from "@/helpers/input_validation"

import styles from "./RegistrationForm.module.css"
import PortalButton from "../PortalButton/PortalButton"

const passwordRequirements = new Map<
    "minLength" | "upperCase" | "lowerCase" | "digit", boolean
>([
    ["upperCase", true], ["lowerCase", true], ["digit", true], ["minLength", true]
])

const getValidityClass = (value: string, condition: boolean) => {
    const isValid = isConditionFulfilled(value, condition)
    return isValid ? "" : styles["error-text"]
}

export default function RegistrationForm() {
    const { register, watch, handleSubmit, formState: { errors, touchedFields } } = useForm({
        mode: "onChange"
    })
    
    return (
        <BaseFormWrapper>
            <form className={styles["form-element"]}>
                <div>
                    <TextField 
                        fieldDisplayName="Email" 
                        className={styles["input-element"]} 
                        watchedValue={watch("email")}
                        registerObject={register("email", {
                            pattern: {
                                value: IS_EMAIL_REGEX,
                                message: "Please provide a valid email address."
                            }
                        })}
                    />
                    {errors.email && (
                        <div 
                            className={`
                                ${styles["simple-validation-message"]}
                                ${styles["error-text"]}
                            `}
                        >
                            {errors.email.message as string}
                        </div>
                    )}
                </div>
                <div>
                    <PasswordField 
                        fieldDisplayName="Password" 
                        className={`
                            ${styles["input-element"]}
                            ${styles["password-field"]}
                        `}
                        watchedValue={watch("password")}
                        registerObject={register("password", {
                            required: true,
                            validate: (value: string) => {
                                let result = true

                                passwordRequirements.set("minLength", (value.length >= 8))
                                result &&= (passwordRequirements.get("minLength") ?? true)

                                passwordRequirements.set("upperCase", hasUpperCase(value))
                                result &&= (passwordRequirements.get("upperCase") ?? true)
                                
                                passwordRequirements.set("lowerCase", hasLowerCase(value))
                                result &&= (passwordRequirements.get("lowerCase") ?? true)
                                
                                passwordRequirements.set("digit", hasDigit(value))
                                result &&= (passwordRequirements.get("digit") ?? true)

                                return result
                            }
                        })}
                    />
                    <div className={styles["password-requirements-message"]}>
                        <span>Password must fulfill all requirements below.</span>
                        <ul>
                            <li 
                                className={getValidityClass(
                                    watch("password"), 
                                    passwordRequirements.get("minLength") as boolean
                                )}
                            >
                                Minimum 8 characters.
                            </li>
                            <li 
                                className={getValidityClass(
                                    watch("password"), 
                                    passwordRequirements.get("upperCase") as boolean
                                )}
                            >
                                Contains at least one upper case letter.
                            </li>
                            <li
                                className={getValidityClass(
                                    watch("password"), 
                                    passwordRequirements.get("lowerCase") as boolean
                                )}
                            >
                                Contains at least one lower case letter.
                            </li>
                            <li
                                className={getValidityClass(
                                    watch("password"), 
                                    passwordRequirements.get("digit") as boolean
                                )}
                            >
                                Contains at least one digit.
                            </li>
                            <li className={""}>
                                Contains at least one special character.
                            </li>
                        </ul>
                        {
                            
                        }
                    </div>
                </div>
                <div>
                    <PasswordField  
                        fieldDisplayName="Confirm Password"
                        className={styles["input-element"]} 
                        watchedValue={watch("confirm-password")}
                        registerObject={register("confirm-password", {
                            required: true,
                            validate: {
                                passwordMatch: (value) => value === watch("password") || "The values of the passwords don't match."
                            }
                        })}
                    />
                    {errors["confirm-password"] && (
                        <div 
                            className={`
                                ${styles["simple-validation-message"]}
                                ${styles["error-text"]}
                            `}
                        >
                            {errors["confirm-password"].message as string}
                        </div>
                    )}
                </div>
                <PortalButton 
                    className={styles["submit-button"]}
                    onClick={() => {
                        handleSubmit(
                            (data) => {
                                // sbClient.auth.signUp({
                                //     email: data.email,
                                //     password: data.password
                                // })
                                console.log("Creating email...") // debug
                            },
                            (errors) => {
                                console.log(errors)
                                console.log("error")
                            }
                        )
                    }}
                >
                    Create account
                </PortalButton>
                <span className={styles["verification-required-message"]}>*Email verification required.</span>
            </form>
        </BaseFormWrapper>
    )    
}