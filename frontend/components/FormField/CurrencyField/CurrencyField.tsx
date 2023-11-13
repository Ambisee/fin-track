import { SetStateAction } from "react"
import FormTemplate, {CommonFieldProps, UseHookFormFieldProps} from "../FormTemplate"

import styles from "./CurrencyField.module.css"

type CurrencyFieldProps = CommonFieldProps & UseHookFormFieldProps & {
    sign: boolean,
    toggleSign: () => void,
}

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
                        className={styles["sign-toggler"]}
                        onClick={() => toggleSign()}
                    >
                        <span>
                            {sign ? "\u2212" : "+"}
                        </span>
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
