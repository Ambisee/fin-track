"use client"

import { useForm } from "react-hook-form"

import PasswordField from "../FormField/PasswordField/PasswordField"
import ActionButton from "../ActionButton/ActionButton"
import { sbClient } from "@/supabase/supabase_client"

// import styles from "./RecoveryForm.module.css"
import registrationFormStyles from "../RegistrationForm/RegistrationForm.module.css"
import { 
    isConditionFulfilled,
    hasDigit,
    hasLowerCase,
    hasUpperCase,
    hasSpecialChar,
    noWhiteSpace,
} from "@/helpers/input_validation"
import BaseFormWrapper from "../BaseFormWrapper/BaseFormWrapper"

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
    return isValid ? "" : registrationFormStyles["error-text-color"]
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

export default function RecoveryForm() {
    const { register, watch, handleSubmit, formState: { errors, dirtyFields } } = useForm({
        mode: "onChange"
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
            passwordMatch: (value) => value === watch("password") || "The values of the passwords don't match."
        }
    })

    return (
        <BaseFormWrapper>
            <form
                className={registrationFormStyles["form-element"]}
                onSubmit={handleSubmit(
                    (data) => {
                        sbClient.auth.updateUser({
                            password: data.password
                        }).then((value) => {
                            if (value.error) {
                                alert(value.error);
                                return
                            }

                            alert("Password has been updated.")
                        })
                    },
                    (error) => {

                    }
                )}
            >
                <div>
                    <PasswordField 
                        fieldDisplayName="Password" 
                        className={`
                            ${registrationFormStyles["input-element"]}
                            ${registrationFormStyles["password-field"]}
                        `}
                        watchedValue={watch("password")}
                        registerObject={passwordRegisterObject}
                    />
                    <div 
                        className={`
                            ${registrationFormStyles["error-text-color"]}
                            ${registrationFormStyles["error-text-font"]}
                            ${registrationFormStyles["error-text-pos-absolute"]}
                            ${errors.password === undefined ? registrationFormStyles["hide-error"] : ""}
                        `}
                    >
                        {(errors?.password?.type === "required") ? errors.password.message as string : ""}
                    </div>
                    <div className={registrationFormStyles["password-requirements-message"]}>
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
                        fieldDisplayName="Confirm password"
                        registerObject={confirmPasswordRegisterObject}
                        watchedValue={watch("confirm-password")}
                    />
                    <div 
                        className={`
                            ${registrationFormStyles["error-text-font"]}
                            ${registrationFormStyles["error-text-pos-absolute"]}
                            ${registrationFormStyles["error-text-color"]}
                            ${errors["confirm-password"] === undefined ? registrationFormStyles["hide-error"] : ""}
                        `}
                    >
                        {errors["confirm-password"] ? errors["confirm-password"].message as string : ""}
                    </div>
                </div>
                <ActionButton 
                    className={registrationFormStyles["submit-button"]}
                    type="submit"
                >
                    Submit
                </ActionButton>
            </form>
        </BaseFormWrapper>
    )
}
