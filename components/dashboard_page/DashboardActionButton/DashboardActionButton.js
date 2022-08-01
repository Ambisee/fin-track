import React from 'react'
import styles from './DashboardActionButton.module.css'

/**
 * Button component that triggers 
 * state changing actions within the dashboard
 * 
 * @param {Object} props 
 *      The properties that will be  passed down to the components
 * @param {React.Component} props.children
 *      The child elements that will be included inside the button
 * @param {String} props.className
 *      Additional CSS class that will be added to the button
 * @param {Function} props.onClick
 *      the callback function that fires when the button is clicked
 * @returns 
 */
export default function DashboardActionButton(props) {
    const {
        children,
        className,
        onClick
    } = props

    return (
        <button className={`${className} ${styles.actionButton}`} onClick={onClick}>
            {children}
        </button>
    )
}