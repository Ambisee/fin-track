"use client"

import { forwardRef } from "react"

import { FormFieldProps, variantClasses } from "../FormTemplate"

import styles from "./FormField.module.css"

interface DateFieldProps
    extends FormFieldProps {

}

const DateField = forwardRef<HTMLInputElement, DateFieldProps>(function DateField({
    value,
    onChange,
    fieldName,
    variant="outlined",
    ...props
}, ref) {
  return (
    <div className={styles["input-field-container"]}>
        <label htmlFor={props.id}>
            {fieldName ?? props.name?.split(" ").map(text => `${text[0].toUpperCase()}${text.slice(1)}`).join(" ")}
        </label>
        <input
            ref={ref}
            onChange={onChange}
            value={value}
            type="date"
            className={`
                ${styles["input-field-common"]}
                ${styles[variantClasses[variant]]}
            `}
            {...props}
        />
    </div>
  )
})

export default DateField
