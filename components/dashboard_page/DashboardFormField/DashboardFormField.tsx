import { ComponentPropsWithRef } from 'react'
import styles from './DashboardFormField.module.css'
import DateInput from './DateInput'

interface DashboardFormFieldProps extends ComponentPropsWithRef<'input'> {
    withLabel: boolean
}

/**
 * Custom form field component to be used within
 * the dashboard
 * 
 * @param props The properties that will be passed down to the component
 * @param props.inputAttr The attributes of the inner <input> elements
 * @param props.withLabel Indicates whether or not to display a <label> element to display
 *      the `name` of the field
 */
export default function DashboardFormField(props: DashboardFormFieldProps) {
    const {
        withLabel = true,
        ...inputAttr
    } = props

    return (
        <div className={styles.fieldWrapper}>
            {withLabel && <label htmlFor={inputAttr.name}>{inputAttr.name}</label>}
            {inputAttr.type == 'date' ?
                <DateInput 
                    id={inputAttr.name}
                    name={inputAttr.name}
                    type={inputAttr.type}
                    placeholder={inputAttr.name}
                    required={inputAttr.required}
                    value={inputAttr.value} 
                    onChange={inputAttr.onChange}
                    className={`
                        ${styles.dashboardFormField}
                        ${inputAttr.className}
                    `}
                /> :
                <input 
                    id={inputAttr.name}
                    name={inputAttr.name}
                    type={inputAttr.type}
                    value={inputAttr.value}
                    placeholder={inputAttr.name}
                    required={inputAttr.required}
                    disabled={inputAttr.disabled}
                    onChange={inputAttr.onChange}
                    autoComplete="off"
                    className={`
                        ${styles.dashboardFormField}
                        ${inputAttr.className}
                    `}
                />
            }
        </div>
    )
}