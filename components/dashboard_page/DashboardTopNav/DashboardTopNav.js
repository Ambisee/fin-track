import Link from 'next/link'
import { useState } from 'react'

import { REDIRECT, HOVER, TOGGLE_DROPDOWN } from '../dispatcher'
import { useAuth } from '../../../firebase/auth'

import styles from './DashboardTopNav.module.css'

/**
 * The top dashboard navigation bar component.
 * Part of the dashboard's layout component
 * 
 * @param {Object} props
 *      The properties that will be passed down to the component
 * @param {String} props.className
 *      additional CSS class for the parent element of this component
 * @param {Function} props.sideBarCallback
 *      function to toggle the side navigation bar in mobile viewports
 * @param {Object} props.navState
 *      Dashboard navigation bar's `state` Object
 * @param {Function} props.navDispatch
 *      Dashboard navigation bar's `dispatch` function
 */
export default function DashboardTopNav(props) {
    const {
        className,
        sideBarCallback,
        navState,
        navDispatch
    } = props

    /**
     * toggleDropdown: Boolean =
     *      boolean value for toggling the dropdown menu or not
     * auth: Object =
     *      Authentication context used to retrieve the user's details
     */
    const auth = useAuth()

    return (
        <nav
            className={`
                ${styles.topNavBar}
                ${className}
            `}
        >
            {/* Mobile side navigation bar toggler */}
            <button onClick={sideBarCallback} className={styles.navBarToggler}>
                <div />
                <div />
                <div />
            </button>
            <div></div>

            {/* Dropdown menu */}
            <div 
                className={`${styles.profile} ${navState.isDropdownToggled && styles.displayDropdown}`} 
                onClick={() => navDispatch({type: TOGGLE_DROPDOWN, value: !(navState.isDropdownToggled)})}
            >
                <div className={styles.profileInfo}>
                    <span className={styles.profileName}>{auth.user.displayName.split()[0]}</span>
                    <div className={styles.profilePicture}></div>
                </div>
                <div className={styles.profileDropdown}>
                    <Link href='/dashboard/account' passHref>
                        <a 
                            onClick={() => {
                                navDispatch({ type: REDIRECT, value: 1 })
                                navDispatch({type: HOVER, value: 1})
                            }}
                        >
                            Settings
                        </a>
                    </Link>
                    <button onClick={auth.userSignOut}>Logout</button>
                </div>
            </div>
        </nav>
    )
}
