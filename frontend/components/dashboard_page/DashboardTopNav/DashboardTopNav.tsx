import Link from 'next/link'
import Image from 'next/image'
import { Ref } from 'react'

import { REDIRECT, HOVER, TOGGLE_DROPDOWN } from '../constants'
import { useAuth } from '../../../firebase/auth'

import styles from './DashboardTopNav.module.css'
import { useDashboardContext } from '../context'

/**
 * The top dashboard navigation bar component.
 * Part of the dashboard's layout component
 * 
 * @param props The properties that will be passed down to the component
 * @param props.className Additional CSS class for the parent element of this component
 * @param props.sideBarCallback Function to toggle the side navigation bar in mobile viewports
 * @param props.profileInfoRef Reference to the profile info section of the top navigation bar
 * 
 * @return
 */
export default function DashboardTopNav(props) {
    const {
        className,
        sideBarCallback,
        profileInfoRef
    } = props

    const {state, dispatch} = useDashboardContext()
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
                className={`${styles.profile} ${state.isDropdownToggled && styles.displayDropdown}`} 
                onClick={() => dispatch({type: TOGGLE_DROPDOWN, value: !(state.isDropdownToggled)})}
                ref={profileInfoRef}
            >
                <div className={styles.profileInfo}>
                    <span className={styles.profileName}>{auth.user?.displayName}</span>
                    <div className={styles.profilePicture}>
                        {auth.user.photoURL &&
                            <Image 
                                src={auth.user.photoURL}
                                alt="profile.jpg"
                                layout="responsive"
                                width={36}
                                height={36}
                            />
                        }
                    </div>
                </div>
                <div className={styles.profileDropdown}>
                    <Link href='/dashboard/account' passHref>
                        <a 
                            onClick={() => {
                                dispatch({ type: REDIRECT, value: 1 })
                                dispatch({type: HOVER, value: 1})
                            }}
                        >
                            Settings
                        </a>
                    </Link>
                    <button onClick={() => {
                        auth.userSignOut()
                    }}>
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    )
}
