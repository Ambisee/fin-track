"use client"

import { useState } from "react"

import FormTemplate, { CommonFieldProps, FormTemplateProps, UseHookFormFieldProps } from "../FormTemplate"

import styles from "./TextField.module.css"
import { UseFormRegisterReturn } from "react-hook-form"

type TextFieldProps = CommonFieldProps & UseHookFormFieldProps 

export default function TextField({
    variant,
    className,
    watchedValue,
    registerObject,
    fieldDisplayName,
    showLabel=true,
    ...props
}: TextFieldProps) {
    const initializeDisplayName = () => {
        if (fieldDisplayName !== undefined) return fieldDisplayName
        return props.name?.split(" ").map(text => `${text[0]}${text.slice(1)}`).join(" ") ?? ""
    }

    const displayName = initializeDisplayName()

    return (
        <FormTemplate 
            variant={variant} 
        >
            <div 
                className={`
                    ${styles["input-container"]}
                    ${className}
                `}
            >
                <input 
                    type="text"
                    placeholder={showLabel ? "" : props.placeholder}
                    className={`
                        ${styles["input-element"]}
                        ${(watchedValue) && styles["filled"]}
                    `}
                    {...props}
                    {...(registerObject ?? {})}
                />

                {/* Label that floats when input field is focused or filled */}
                <label 
                    htmlFor={props.id} 
                    className={`
                        ${styles["input-label"]}
                        ${showLabel ? "" : styles["hidden"]}
                    `}
                >
                    {displayName}
                </label>
            </div>
        </FormTemplate>
    )
}
