import Link from 'next/link'
import { useState } from 'react'

import { useAuth } from '../../../firebase/auth'
import styles from './DashboardTopNav.module.css'

export default function DashboardTopNav(props) {
    const {
        className,
        sideBarCallback
    } = props
    const [toggleDropdown, setToggleDropdown] = useState(false)
    const auth = useAuth()

    return (
        <nav
            className={`
                ${styles.topNavBar}
                ${className}
            `}
        >
            <button onClick={sideBarCallback} className={styles.navBarToggler}>
                <div />
                <div />
                <div />
            </button>
            <div></div>
            <div className={`${styles.profile} ${toggleDropdown && styles.displayDropdown}`} onClick={() => setToggleDropdown(current => !current)}>
                <div className={styles.profileInfo}>
                    <span className={styles.profileName}>User</span>
                    <div className={styles.profilePicture}></div>
                </div>
                <div className={styles.profileDropdown}>
                    <Link href='/dashboard/account' passHref>
                        <a>Settings</a>
                    </Link>
                    <button onClick={auth.userSignOut}>Logout</button>
                </div>
            </div>
        </nav>
    )
}
