import React, { ComponentPropsWithRef, ReactNode } from 'react'

import styles from './DashboardActionButton.module.css'

/**
 * Button component that triggers 
 * state changing actions within the dashboard
 * 
 * @param props The properties that will be  passed down to the components
 * @param props.children The child elements that will be included inside the button
 * @param props.buttonAtr The attribute of the inner <button> element
 * @returns 
 */
export default function DashboardActionButton(
    props:  ComponentPropsWithRef<'button'> & {children: ReactNode}
) : JSX.Element {
    const {
        children,
        ...buttonAttr
    } = props

    return (
        <button 
            type={buttonAttr.type}
            onClick={buttonAttr.onClick}
            style={buttonAttr.style}
            className={`
                ${buttonAttr.className} 
                ${styles.actionButton}
            `}
        >
            {children}
        </button>
    )
}