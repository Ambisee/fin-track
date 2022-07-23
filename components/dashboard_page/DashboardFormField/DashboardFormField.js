/**
 * components/dashboard_page/DashboardFormField/DashboardFormField.js
 * 
 * The input field component that will be used in the dashboard
 * 
 */
import styles from './DashboardFormField.module.css'

export default function DashboardFormField(props) {
    /**
     * 
     */
    const {
        type,
        name,
        className,
        required = false,
        value = undefined,
        onChange = () => {},
    } = props

    return (
        <div className={styles.fieldWrapper}>
            <label htmlFor={name}>{name}</label>
            <input 
                id={name}
                name={name}
                type={type}
                required={required}
                value={value} 
                onChange={onChange}
                autoCorrect={false}
                className={`
                    ${styles.dashboardFormField}
                    ${className}
                `}
            />
        </div>
    )
}