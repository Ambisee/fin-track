/**
 * components/dashboard_page/DashboardLayout/DashboardLayout.js
 * 
 * General layout component used within the dashboard.
 * Consists the dashboard navigation bars and an area to display the content
 */
import { useState } from "react"
import { useAuth } from "../../../firebase/auth"
import DashboardSideNav from "../DashboardSideNav/DashboardSideNav"
import DashboardTopNav from "../DashboardTopNav/DashboardTopNav"

import styles from './DashboardLayout.module.css'

export default function DashboardLayout(props) {
    /**
     * children: React.Component =
     *      React component to be rendered within the layout
     * user: Object = 
     *      Object containing the current user's information
     */
    const {
        children,
    } = props

    /**
     * navToggle: Boolean =
     *      boolean value used in mobile viewports denoting whether
     *      the side navigation bar is toggled or not
     */
    const [navToggle, setNavToggle] = useState(false)
    const auth = useAuth()

    if (auth?.user == undefined) {
        return children
    }

    return (
        <div className={styles.dashboardLayout}>
            {/* Navigation Bar */}
            <DashboardSideNav 
                onRedirect={() => setNavToggle(false)}
                className={`${navToggle && styles.displayNav} ${styles.sideNav}`}
                pageIndex={0} 
            />
            <DashboardTopNav 
                profileImage={auth.user}
                className={styles.topNav}
                sideBarCallback={() => setNavToggle(true)}
            />

            {/* Filter div element to be toggled when the side navigation bar is  */}
            <div 
                className={`${styles.darkFilter} ${navToggle && styles.displayNav}`}
                onClick={() => setNavToggle(false)}
            />
            
            {/* Content */}
            <div className={styles.content}>
                {children}
            </div>
        </div>
    )
}