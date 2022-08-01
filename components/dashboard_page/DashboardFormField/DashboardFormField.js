import styles from './DashboardFormField.module.css'
import DateInput from './DateInput'

/**
 * Custom form field component to be used within
 * the dashboard
 * 
 * @param {Object} props 
 *      The properties that will be passed down to the component
 * @param {String} props.type
 *      The `type` property of the internal <input> element
 * @param {String} props.name
 *      The `name` property of the internal <input> element
 * @param {String} props.className
 *      Additional CSS classes that will be passed down to the
 *      internal <input> element
 * @param {Boolean} props.required
 *      The `required` constraint of the internal <input> element
 * @param {Boolean} props.withLabel
 *      Indicates whether or not to display a <label> element to display
 *      the `name` of the field
 * @param {Function} props.onChange
 *      The callback function that fires up when the value of the
 *      <input> element changes
 * @returns 
 */
export default function DashboardFormField(props) {
    const {
        type,
        name,
        className,
        required = false,
        value = undefined,
        withLabel = true,
        onChange = () => {},
    } = props

    return (
        <div className={styles.fieldWrapper}>
            {withLabel && <label htmlFor={name}>{name}</label>}
            {type == 'date' ?
                <DateInput 
                    id={name}
                    name={name}
                    type={type}
                    placeholder={name}
                    required={required}
                    value={value} 
                    onChange={onChange}
                    className={`
                        ${styles.dashboardFormField}
                        ${className}
                    `}
                /> :
                <input 
                    id={name}
                    name={name}
                    type={type}
                    placeholder={name}
                    required={required}
                    value={value} 
                    onChange={onChange}
                    autoComplete="off"
                    className={`
                        ${styles.dashboardFormField}
                        ${className}
                    `}
                />
            }
        </div>
    )
}