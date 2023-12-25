import { useState, SetStateAction, useEffect, useRef } from "react"
import { JetBrains_Mono, Ubuntu_Mono } from "next/font/google"

import FormTemplate, {CommonFieldProps, UseHookFormFieldProps} from "../FormTemplate"

import styles from "./CurrencyField.module.css"

type CurrencyFieldProps = CommonFieldProps & UseHookFormFieldProps & {
    sign: boolean,
    toggleSign: () => void,
}

const jetBrainsMono = JetBrains_Mono({
    weight: ["200"],
    subsets: ["latin"]
})

export default function CurrencyField({
    sign,
    fieldDisplayName,
    variant,
    className,
    watchedValue,
    showLabel=true,
    registerObject,
    toggleSign,
    ...props
}: CurrencyFieldProps) {
    const inputRef = useRef<HTMLInputElement | null>(null)
    const [filled, setFilled] = useState(false)
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

    const displayName = initializeDisplayName()

    const isFilled = () => {
        let res = true;

        res &&= (watchedValue !== undefined ? watchedValue : true)
        res &&= (watchedValue !== undefined ? true : filled)

        return res
    }

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
                    <button 
                        type="button"
                        tabIndex={-1}
                        className={`
                            ${styles["sign-toggler"]}
                            ${jetBrainsMono.className}
                        `}
                        onClick={() => toggleSign()}
                    >
                        {sign ? "\u2013" : "+"}
                    </button>
                <div className={styles["input-wrapper"]}>
                    <input 
                        type="text" 
                        onChange={(e) => {
                            registerObject?.onChange(e)
                            if (e.target.value === undefined || e.target.value === "") {
                                setFilled(false)
                            } else {
                                setFilled(true)
                            }
                        }}
                        onBlur={(e) => {
                            registerObject?.onBlur(e)
                        }}
                        ref={registerObject?.ref}
                        name={registerObject?.name}
                        className={`
                            ${styles["input-element"]}
                            ${isFilled() && styles["filled"]}
                        `}
                        {...props}
                    />
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
            </div>
        </FormTemplate>
    )
}
