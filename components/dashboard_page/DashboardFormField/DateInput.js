import { useRef } from 'react'
import Image from 'next/image'

import styles from './DateInput.module.css'
import arrowHead from '../../../public/arrow-head.svg'

/**
 * Custom component for `date` type DashboardFormField
 * 
 * @param {Object} props 
 *      The properties that will be passed down to the component
 * @param {String} props.name
 *      The `name` property of the internal <input> element
 * @param {String} props.className
 *      Additional CSS classes that will be passed down to the
 *      internal <input> element
 * @param {Boolean} props.required
 *      The `required` constraint of the internal <input> element
 * @param {Function} props.onChange
 *      The callback function that fires up when the value of the
 *      <input> element changes
 * @returns 
 */
export default function DateInput(props) {
    const {
        name,
        className,
        required = false,
        value = undefined,
        onChange = () => {},
    } = props

    const dateRef = useRef()
    const textRef = useRef()

    return (
        <div className={`
                ${className}
                ${styles.dateInput}
            `}
        >
            <input 
                type="date" 
                name={name}
                value={value} 
                ref={dateRef}
                onChange={onChange}
            />
            <input
                type="text"
                name={name}
                value={value}
                ref={textRef}
                placeholder={name}
                required={required}
                onChange={onChange}
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