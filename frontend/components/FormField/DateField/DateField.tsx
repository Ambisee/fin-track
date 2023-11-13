"use client"

import { InputHTMLAttributes, RefObject, forwardRef, useRef } from "react"
import { UseFormRegisterReturn } from "react-hook-form"

import FormTemplate, { CommonFieldProps, UseHookFormFieldProps } from "../FormTemplate"

import styles from "./DateField.module.css"

type DateFieldProps = CommonFieldProps & UseHookFormFieldProps

const dateFormat = 'YYYY-MM-DD'

export default function DateField({
    value,
    onChange: propsOnChange,
    className,
    registerObject,
    fieldDisplayName,
    watchedValue,
    variant,
    ...props
}: DateFieldProps) {
   const datePickerProviderRef = useRef<HTMLInputElement | null>(null)
   const textFieldRef = useRef<HTMLInputElement | null>(null)
   const {ref, onChange, ...regObjRest} = registerObject as UseFormRegisterReturn

   const showDatePicker = () => {
        if (datePickerProviderRef.current !== undefined && datePickerProviderRef.current !== null) {
            datePickerProviderRef.current.showPicker()
        } 
    }

  return (
    <FormTemplate variant={variant}>
        <div className={`
            ${styles["input-field-container"]}
            ${className}
        `}>
            <input
                ref={(e) => {
                    ref(e)
                    textFieldRef.current = e
                }}
                onFocus={(e) => {}}
                onKeyDown={(e) => {}}
                onClick={showDatePicker}
                autoComplete="false"
                type="text"
                className={`
                    ${styles["input-element"]}
                    ${watchedValue && styles["filled"]}
                `}
                {...props}

            />
            <label className={styles["input-label"]}>
                {fieldDisplayName ?? props.name?.split(" ").map(text => `${text[0].toUpperCase()}${text.slice(1)}`).join(" ")}
            </label>
            <input 
                type="date"
                ref={datePickerProviderRef}
                className={styles["date-picker-provider"]}
                onChange={(e) => {
                    if (textFieldRef.current === null || textFieldRef.current === undefined) {
                        return
                    }
                    textFieldRef.current.value = e.target.value
                    onChange(e)
                }}
                {...regObjRest}
                />
            <button 
                className={styles["date-picker"]} 
                type="button"
                onClick={showDatePicker}
            >
                <svg viewBox="0 0 549 630" xmlns="http://www.w3.org/2000/svg">
                    <path d="M466.83 50.3219H437.76V0H383.04V50.3219H164.16V0H109.44V50.3219H82.08C36.8197 50.3219 0 87.1416 0 132.402V547.569C0 592.83 36.8197 629.649 82.08 629.649H466.83C512.09 629.649 548.91 592.83 548.91 547.569V132.402C548.91 87.1416 512.09 50.3219 466.83 50.3219ZM494.19 547.569C494.19 562.652 481.919 574.929 473.67 574.929H88.92C66.991 574.929 54.72 562.652 54.72 547.569V212.409H494.19V547.569ZM424.251 410.598H307.629V506.707H424.251V410.598ZM424.251 271.917H307.629V368.026H424.251V271.917ZM241.281 271.917H124.659V368.026H241.281V271.917ZM241.281 410.598H124.659V506.707H241.281V410.598Z" fill="black"/>
                </svg>
            </button>
        </div>
    </FormTemplate>
  )
}
