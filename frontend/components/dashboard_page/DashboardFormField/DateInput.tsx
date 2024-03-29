import Image from 'next/image'
import { ComponentPropsWithRef, useRef } from 'react'

import styles from './DateInput.module.css'
import arrowHead from '../../../public/arrow-head.svg'

interface DateInputProps extends ComponentPropsWithRef<'input'> {
    id: any
}

/**
 * Custom component for `date` type DashboardFormField
 * 
 * @param props The properties that will be passed down to the component
 * @param props.id The identifier for react to handle re-render
 * @param props.inputProps The attributes of the inner <input> elements
 */
export default function DateInput(props: DateInputProps) {
    const {...inputProps} = props
    
    const dateRef = useRef<HTMLInputElement>()
    const textRef = useRef<HTMLInputElement>()

    return (
        <div className={`
                ${inputProps.className}
                ${styles.dateInput}
            `}
        >
            <input 
                type="date" 
                name={inputProps.name}
                value={inputProps.value} 
                ref={dateRef}
                onChange={inputProps.onChange}
            />
            <input
                type="text"
                name={inputProps.name}
                value={inputProps.value}
                ref={textRef}
                placeholder={inputProps.name}
                required={inputProps.required}
                onChange={inputProps.onChange}
            />
            <button 
                type="button" 
                className={styles.toggleCalendar}
                onClick={() => {
                    dateRef.current.showPicker()
                }}
            >
                <Image 
                    className={styles.calendarIcon}
                    src={arrowHead}
                    alt="Datepicker"
                    width={16}
                    height={16}
                />
            </button>
        </div>
    )
}