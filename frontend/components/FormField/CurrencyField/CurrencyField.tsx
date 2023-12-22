import { SetStateAction } from "react"
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
                        className={`
                            ${styles["input-element"]}
                            ${watchedValue && styles["filled"]}
                        `}
                        {...props}
                        {...registerObject}
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
