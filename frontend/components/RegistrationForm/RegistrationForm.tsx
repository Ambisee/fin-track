"use client"

import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"

import TextField from "../FormField/TextField/TextField"
import PasswordField from "../FormField/PasswordField/PasswordField"
import BaseFormWrapper from "../BaseFormWrapper/BaseFormWrapper"
import ActionButton from "../ActionButton/ActionButton"
import usePortalLoader from "@/hooks/usePortalLoader"
import { sbClient } from "@/supabase/supabase_client"
import { LOGIN_PAGE_URL } from "@/helpers/url_routes"
import { 
    IS_EMAIL_REGEX,
    ONLY_ALPHANUMERIC,
    hasDigit,
    hasLowerCase,
    hasSpecialChar,
    hasUpperCase,
    isConditionFulfilled,
    noWhiteSpace
} from "@/helpers/input_validation"

import styles from "./RegistrationForm.module.css"

const passwordRequirements = new Map<
    "minLength" | "upperCase" | "lowerCase" | "digit" | "specialChar" | "noSpace", boolean
>([
    ["upperCase", true], 
    ["lowerCase", true], 
    ["digit", true], 
    ["minLength", true],
    ["specialChar", true],
    ["noSpace", true]
])

const getValidityClass = (value: string, condition: boolean, isDirty: boolean) => {
    const isValid = isConditionFulfilled(value, condition) || !isDirty
    return isValid ? "" : styles["error-text-color"]
}

const validatePassword = (value: string) => {
    let result = true

    passwordRequirements.set("minLength", (value.length >= 8))
    result &&= (passwordRequirements.get("minLength") ?? true)

    passwordRequirements.set("upperCase", hasUpperCase(value))
    result &&= (passwordRequirements.get("upperCase") ?? true)
    
    passwordRequirements.set("lowerCase", hasLowerCase(value))
    result &&= (passwordRequirements.get("lowerCase") ?? true)
    
    passwordRequirements.set("digit", hasDigit(value))
    result &&= (passwordRequirements.get("digit") ?? true)

    passwordRequirements.set("specialChar", hasSpecialChar(value))
    result &&= (passwordRequirements.get("specialChar") ?? true)
    
    passwordRequirements.set("noSpace", noWhiteSpace(value))
    result &&= (passwordRequirements.get("noSpace") ?? true)

    return result
}

export default function RegistrationForm() {
    const router = useRouter()
    const { setIsLoading } = usePortalLoader()
    const { register, watch, control, handleSubmit, getValues, formState: { errors, dirtyFields } } = useForm({
        mode: "onChange"
    })
    
    const usernameRegisterObject = register("username", {
        required: {
            value: true,
            message: "This field is required."
        },
        pattern: {
            value: ONLY_ALPHANUMERIC,
            message: "Usernames can only have alphabets and numbers."
        },
        minLength: {
            value: 8,
            message: "Usernames must be at least 8 characters long."
        }
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

    const passwordRegisterObject = register("password", {
        required: {
            value: true,
            message: "This field is required."
        },
        validate: validatePassword
    })

    const confirmPasswordRegisterObject = register("confirm-password", {
        required: {
            value: true,
            message: "This field is required."
        },
        validate: {
            passwordMatch: (value) => value === getValues("password") || "The values of the passwords don't match."
        }
    })

    return (
        <BaseFormWrapper>
            <form 
                autoComplete="off"
                className={styles["form-element"]}
                onSubmit={(e) => {
                    e.preventDefault()
                    handleSubmit(
                        (data) => {
                            setIsLoading(true)
                            sbClient.auth.signUp({
                                email: data.email,
                                password: data.password,
                                options: {
                                    data: {
                                        username: data.username,
                                    },
                                    emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/login-callback`
                                }
                            }).then((value) => {
                                setIsLoading(false)
                                if (value.error) {
                                    alert(value.error.message)
                                    return
                                }

                                alert(
                                    "The account has been created and a verification email has been sent to " +
                                    `${value.data.user?.email}. Please verify your email address before ` +
                                    "logging in. "
                                )
                                router.push(LOGIN_PAGE_URL)
                            })
                        },
                        (errors) => {
                            
                        }
                    )()

                    return false;
                }}
            >
                <div>
                    <TextField
                        required 
                        control={control}
                        autoComplete="new-password"
                        fieldDisplayName="Username" 
                        className={styles["input-element"]} 
                        registerObject={usernameRegisterObject}
                    />
                    <div 
                        className={`
                            ${styles["error-text-font"]}
                            ${styles["error-text-pos-absolute"]}
                            ${styles["error-text-color"]}
                            ${errors["username"] === undefined ? styles["hide-error"] : ""}
                        `}
                    >
                        {errors["username"] ? errors["username"].message as string : ""}
                    </div>
                </div>
                <div>
                    <TextField 
                        required
                        control={control}
                        autoComplete="new-password"
                        fieldDisplayName="Email" 
                        className={styles["input-element"]} 
                        registerObject={emailRegisterObject}
                    />
                    <div 
                        className={`
                            ${styles["error-text-font"]}
                            ${styles["error-text-pos-absolute"]}
                            ${styles["error-text-color"]}
                            ${errors["email"] === undefined ? styles["hide-error"] : ""}
                        `}
                    >
                        {errors["email"] ? errors["email"].message as string : ""}
                    </div>
                </div>
                <div>
                    <PasswordField 
                        required
                        control={control}
                        autoComplete="new-password"
                        fieldDisplayName="Password" 
                        className={`
                            ${styles["input-element"]}
                            ${styles["password-field"]}
                        `}
                        registerObject={passwordRegisterObject}
                    />
                    <div 
                        className={`
                            ${styles["error-text-color"]}
                            ${styles["error-text-font"]}
                            ${styles["error-text-pos-absolute"]}
                            ${errors.password === undefined ? styles["hide-error"] : ""}
                        `}
                    >
                        {(errors?.password?.type === "required") ? errors.password.message as string : ""}
                    </div>
                    <div className={styles["password-requirements-message"]}>
                        <span>Password must fulfill all requirements below.</span>
                        <ul>
                            <li 
                                className={getValidityClass(
                                    watch("password"), 
                                    passwordRequirements.get("minLength") as boolean,
                                    dirtyFields["password"] ?? false
                                )}
                            >
                                Minimum 8 characters.
                            </li>
                            <li 
                                className={getValidityClass(
                                    watch("password"), 
                                    passwordRequirements.get("upperCase") as boolean,
                                    dirtyFields["password"] ?? false
                                )}
                            >
                                Contains at least one upper case letter.
                            </li>
                            <li
                                className={getValidityClass(
                                    watch("password"), 
                                    passwordRequirements.get("lowerCase") as boolean,
                                    dirtyFields["password"] ?? false
                                )}
                            >
                                Contains at least one lower case letter.
                            </li>
                            <li
                                className={getValidityClass(
                                    watch("password"), 
                                    passwordRequirements.get("digit") as boolean,
                                    dirtyFields["password"] ?? false
                                )}
                            >
                                Contains at least one numeric character.
                            </li>
                            <li 
                                className={getValidityClass(
                                    watch("password"),
                                    passwordRequirements.get("specialChar") as boolean,
                                    dirtyFields["password"] ?? false
                                )}
                            >
                                Contains at least one special character.
                            </li>
                            <li
                                className={getValidityClass(
                                    watch("password"),
                                    passwordRequirements.get("noSpace") as boolean,
                                    dirtyFields["password"] ?? false
                                )}
                            >
                                No spaces.
                            </li>
                        </ul>
                    </div>
                </div>
                <div>
                    <PasswordField
                        control={control}
                        fieldDisplayName="Confirm Password"
                        className={styles["input-element"]} 
                        registerObject={confirmPasswordRegisterObject}
                    />
                    <div 
                        className={`
                            ${styles["error-text-font"]}
                            ${styles["error-text-pos-absolute"]}
                            ${styles["error-text-color"]}
                            ${errors["confirm-password"] === undefined ? styles["hide-error"] : ""}
                        `}
                    >
                        {errors["confirm-password"] ? errors["confirm-password"].message as string : ""}
                    </div>
                </div>
                <ActionButton
                    type="submit" 
                    className={styles["submit-button"]}
                >
                    Create account
                </ActionButton>
                <span className={styles["verification-required-message"]}>*Email verification required.</span>
            </form>
        </BaseFormWrapper>
    )    
}
