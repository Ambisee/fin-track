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
    children: ReactNode,
    validationComponent?: ReactNode,
    variant?: FormFieldVariant,
}

type CommonFieldProps = 
    Omit<React.HTMLProps<HTMLInputElement>, "children" | "type"> & 
    Omit<FormTemplateCommonProps, "children" | "validationComponent"> &  
{
    className?: string,
    validationComponent?: FC<{error: string}>, // Replace with a react component that accepts an `error` prop
    variant?: FormFieldVariant,
    fieldDisplayName?: string,
    showLabel?: boolean,
}

interface UseHookFormFieldProps {
    registerObject?: UseFormRegisterReturn,
    watchedValue?: string,
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
    const renderValidation = () => {
        if (props.validationComponent === undefined) return <></>
        return props.validationComponent
    }

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
            {renderValidation()}
        </div>
    )
}

export type { FormTemplateProps, CommonFieldProps, UseHookFormFieldProps, ValidationComponentProps }
