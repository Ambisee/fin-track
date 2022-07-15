import { useState } from "react"
import { useAuth } from "../../../firebase/auth"
import DashboardSideNav from "../DashboardSideNav/DashboardSideNav"
import DashboardTopNav from "../DashboardTopNav/DashboardTopNav"

import styles from './DashboardLayout.module.css'

export default function DashboardLayout(props) {
    const {
        children,
        user
    } = props

    const auth = useAuth()
    const [navToggle, setNavToggle] = useState(false)

    if (auth?.user == undefined) {
        return children
    }

    return (
        <div className={styles.dashboardLayout}>
            {/* Navigation Bar */}
            <DashboardSideNav 
                className={`${navToggle && styles.displayNav} ${styles.sideNav}`}
                pageIndex={0} 
            />
            <DashboardTopNav 
                profileImage={user}
                className={styles.topNav}
                sideBarCallback={() => setNavToggle(true)}
            />
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