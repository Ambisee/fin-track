"use client"

import { FC, ReactNode } from "react"
import { FieldErrors, UseFormRegisterReturn } from "react-hook-form"

import styles from "./FormTemplate.module.css"

type FormFieldVariant = "outlined" | "bottom-lined"
type FormTemplateProps = FormTemplateCommonProps

interface ValidationComponentProps {
    errors: FieldErrors,
}
 
interface FormTemplateCommonProps {
    children?: ReactNode,
    variant?: FormFieldVariant,
}

type CommonFieldProps = 
    Omit<React.HTMLProps<HTMLInputElement>, "children" | "type"> & 
    Omit<FormTemplateCommonProps, "children" > &  
{
    className?: string,
    variant?: FormFieldVariant,
    fieldDisplayName?: string,
    showLabel?: boolean,
}

interface UseHookFormFieldProps {
    registerObject?: UseFormRegisterReturn,
    watchedValue?: any,
}

const defaultProps: Pick<CommonFieldProps, "variant" | "showLabel"> = {
    variant: "bottom-lined",
    showLabel: true,
}


export default function FormTemplate({
    children,
    variant="bottom-lined",
    ...props
}: FormTemplateProps) {
    return (
        <div className={styles["form-template"]}>
            <div 
                className={`
                    ${styles[variant]}
                    ${styles["template-input-container"]}
                `}
            >
                {children}
            </div>
        </div>
    )
}

export type { FormTemplateProps, CommonFieldProps, UseHookFormFieldProps }
