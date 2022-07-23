import Link from 'next/link'
import { useState } from 'react'

import { REDIRECT, HOVER } from '../dispatcher'
import { useAuth } from '../../../firebase/auth'

import styles from './DashboardTopNav.module.css'

export default function DashboardTopNav(props) {
    /**
     * className: String =
     *      additional CSS class for the parent element of this component
     * sideBarCallback: Function =
     *      function to toggle the side navigation bar in mobile viewports
     * pageDispatch: Function =
     *      dispatcher function to set the state of the side bar's link
     */
    const {
        className,
        sideBarCallback,
        pageDispatch
    } = props

    /**
     * toggleDropdown: Boolean =
     *      boolean value for toggling the dropdown menu or not
     * auth: Object =
     *      Authentication context used to retrieve the user's details
     */
    const [toggleDropdown, setToggleDropdown] = useState(false)
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
            <div className={`${styles.profile} ${toggleDropdown && styles.displayDropdown}`} onClick={() => setToggleDropdown(current => !current)}>
                <div className={styles.profileInfo}>
                    <span className={styles.profileName}>{auth.user.displayName.split()[0]}</span>
                    <div className={styles.profilePicture}></div>
                </div>
                <div className={styles.profileDropdown}>
                    <Link href='/dashboard/account' passHref>
                        <a 
                            onClick={() => {
                                pageDispatch({ type: REDIRECT, index: 1 })
                                pageDispatch({type: HOVER, index: 1})
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
