"use client"

import { AnimationEventHandler, HTMLProps, useEffect, useRef, useState } from "react"

import FormTemplate, { CommonFieldProps, FormTemplateProps, UseHookFormFieldProps } from "../FormTemplate"

import styles from "./TextField.module.css"
import { UseFormRegisterReturn } from "react-hook-form"

type TextFieldProps = CommonFieldProps & UseHookFormFieldProps

export default function TextField({
    variant,
    className,
    registerObject,
    fieldDisplayName,
    watchedValue,
    showLabel=true,
    ...props
}: TextFieldProps) {
    const [filled, setFilled] = useState(false)
    const inputRef = useRef<HTMLInputElement | null>(null)
    const initializeDisplayName = () => {
        if (fieldDisplayName !== undefined) return fieldDisplayName
        return props.name?.split(" ").map(text => `${text[0]}${text.slice(1)}`).join(" ") ?? ""
    }

    useEffect(() => {
        if (inputRef.current?.value === undefined || inputRef.current.value === "") {
            setFilled(false)
        } else {
            setFilled(true)
        }
    }, [])

    const isFilled = () => {
        let res = true;

        res &&= (watchedValue !== undefined ? watchedValue : true)
        res &&= (watchedValue !== undefined ? true : filled)
        
        return res
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
                    onChange={(e) => {
                        registerObject?.onChange(e)
                        props?.onChange?.(e)

                        if (e.target.value === undefined || e.target.value === "") {
                            setFilled(false)
                        } else {
                            setFilled(true)
                        }
                    }}
                    onBlur={(e) => {
                        registerObject?.onBlur(e)
                        props?.onBlur?.(e)
                        
                        if (e.target.value === undefined || e.target.value === "") {
                            setFilled(false)
                        } else {
                            setFilled(true)
                        }
                    }}
                    name={registerObject?.name}
                    ref={(e) => {
                        registerObject?.ref(e)
                        inputRef.current = e
                    }}
                    className={`
                        ${styles["input-element"]}
                        ${isFilled() && styles["filled"]}
                    `}
                    {...props}
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
