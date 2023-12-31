"use client"

import { useEffect, useRef, useState } from "react"
import { UseFormRegisterReturn } from "react-hook-form"

import FormTemplate, { CommonFieldProps, UseHookFormFieldProps } from "../FormTemplate"

import styles from "./DateField.module.css"
import DatePickerWidget from "./DatePickerWidget"

type DateFieldProps = CommonFieldProps & UseHookFormFieldProps & {
    setValue: (arg: string) => void
}

const dateFormat = 'YYYY-MM-DD'

export default function DateField({
    value,
    onChange: propsOnChange,
    className,
    registerObject,
    fieldDisplayName,
    watchedValue,
    setValue,
    variant,
    ...props
}: DateFieldProps) {
    const [filled, setFilled] = useState(false)
    const [hasShowPicker, setHasShowPicker] = useState(false)
    const [isPickerVisible, setIsPickerVisible] = useState(false)
    const {ref, onChange, ...regObjRest} = registerObject as UseFormRegisterReturn

    const datePickerProviderRef = useRef<HTMLInputElement | null>(null)
    const textFieldRef = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
        let input = document.createElement('input')
        input.setAttribute('type','date')
        input.classList.add(styles["showpicker-support-checker"])

        setHasShowPicker("showPicker" in HTMLInputElement.prototype)
    }, [])

    const showDatePicker = () => {
        if (!hasShowPicker) {
            setIsPickerVisible(c => !c)
            return
        }

        if (
            datePickerProviderRef.current !== undefined && 
            datePickerProviderRef.current !== null
        ) {
            datePickerProviderRef.current.showPicker()
            return
        }
    }

    const isFilled = () => {
        let res = true;
        
        res &&= (watchedValue !== undefined ? !isNaN(watchedValue) : true)
        res &&= (watchedValue !== undefined ? true : filled)

        return res
    }
    
    return (
        <FormTemplate variant={variant}>
            <div 
                className={`
                    ${styles["input-field-container"]}
                    ${className}
                `}
            >
                <input
                    ref={(e) => {
                        ref(e)
                        textFieldRef.current = e
                    }}
                    onChange={(e) => {
                        if (e.target.value === "" || e.target.value === undefined) {
                            setFilled(false)
                        } else {
                            setFilled(true)
                        }
                    }}
                    onBlur={(e) => {
                        const temp = new Date(e.target.value)
                        const d = new Date(temp.getTime() + Math.abs(temp.getTimezoneOffset() * 60000))

                        if (
                            textFieldRef.current === undefined ||
                            textFieldRef.current === null ||
                            datePickerProviderRef.current === null ||
                            datePickerProviderRef.current === undefined
                        ) {
                            return
                        }
                        
                        if (
                            isNaN(d.getTime())
                        ) {
                            textFieldRef.current.value = ""
                            datePickerProviderRef.current.value = ""
                            setValue("")
                            return
                        }

                        const payload = (
                            `${d.getFullYear()}-` +
                            `${String(d.getMonth() + 1).padStart(2, '0')}-` +
                            `${String(d.getUTCDate()).padStart(2, '0')}`
                        )
                        
                        textFieldRef.current.value = payload
                        datePickerProviderRef.current.value = payload

                        setValue(payload)
                    }}
                    autoComplete="false"
                    type="text"
                    className={`
                        ${styles["input-element"]}
                        ${isFilled() && styles["filled"]}
                    `}
                    {...props}

                />
                <label className={styles["input-label"]}>
                    {fieldDisplayName ?? props.name?.split(" ").map(text => `${text[0].toUpperCase()}${text.slice(1)}`).join(" ")}
                </label>
                {!hasShowPicker &&
                    <DatePickerWidget 
                        value={watchedValue}
                        ref={datePickerProviderRef}
                        setIsVisible={setIsPickerVisible}
                        isVisible={isPickerVisible}
                        className={`
                            ${styles["date-picker-widget"]}
                        `}
                        onChange={(value) => {
                            setValue(value)
                            setIsPickerVisible(false)
                        }}
                    />
                }
                {hasShowPicker &&
                    <input 
                        type="date"
                        ref={datePickerProviderRef}
                        className={styles["date-picker-provider"]}
                        onChange={(e) => {
                            if (textFieldRef.current === null || textFieldRef.current === undefined) {
                                return
                            }
                            textFieldRef.current.value = e.target.value
                            
                            if (
                                e.target.value === undefined || 
                                e.target.value === null ||
                                e.target.value === ""
                            ) {
                                setFilled(false)
                            } else {
                                setFilled(true)
                            }

                            onChange(e)
                        }}
                        {...regObjRest}
                    />
                }
                <button 
                    type="button"
                    className={styles["date-picker"]} 
                    onClick={showDatePicker}
                >
                    <svg viewBox="0 0 549 630" xmlns="http://www.w3.org/2000/svg">
                        <path d="M466.83 50.3219H437.76V0H383.04V50.3219H164.16V0H109.44V50.3219H82.08C36.8197 50.3219 0 87.1416 0 132.402V547.569C0 592.83 36.8197 629.649 82.08 629.649H466.83C512.09 629.649 548.91 592.83 548.91 547.569V132.402C548.91 87.1416 512.09 50.3219 466.83 50.3219ZM494.19 547.569C494.19 562.652 481.919 574.929 473.67 574.929H88.92C66.991 574.929 54.72 562.652 54.72 547.569V212.409H494.19V547.569ZM424.251 410.598H307.629V506.707H424.251V410.598ZM424.251 271.917H307.629V368.026H424.251V271.917ZM241.281 271.917H124.659V368.026H241.281V271.917ZM241.281 410.598H124.659V506.707H241.281V410.598Z" />
                    </svg>
                </button>
            </div>
        </FormTemplate>
    )
}
