/**
 * components/dashboard_page/DashboardLayout/DashboardLayout.js
 * 
 * General layout component used within the dashboard.
 * Consists the dashboard navigation bars and an area to display the content
 */
import { useState } from "react"

import { useAuth } from "../../../firebase/auth"
import { usePageTracker } from "../dispatcher"
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
        pageIndex
    } = props

    /**
     * navToggle: Boolean =
     *      boolean value used in mobile viewports denoting whether
     *      the side navigation bar is toggled or not
     * [pageState, pageDispatch]: Array(Object, Function)
     *      The `state` Object and `dispatch` callback function 
     *      used to handle the side nav bar's link hover transition
     * auth: Object =
     *      The object that contains the current user's credentials  
     */
    const [navToggle, setNavToggle] = useState(false)
    const [pageState, pageDispatch] = usePageTracker(pageIndex)
    const auth = useAuth()

    if (auth?.user == undefined) {
        return children
    }

    return (
        <div className={styles.dashboardLayout}>
            {/* Navigation Bar */}
            <DashboardSideNav
                pageIndex={pageIndex}
                onRedirect={() => setNavToggle(false)}
                className={`${navToggle && styles.displayNav} ${styles.sideNav}`}
                pageState={pageState}
                pageDispatch={pageDispatch}
            />
            <DashboardTopNav
                profileImage={auth.user}
                className={styles.topNav}
                pageDispatch={pageDispatch}
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