import { useState } from "react"
import DashboardNav from "../DashboardNav/DashboardNav"

import styles from './DashboardLayout.module.css'

export default function DashboardLayout({ children }) {
    const [navToggle, setNavToggle] = useState(false)
    
    return (
        <div className={styles.dashboardLayout}>
            {/* <button onClick={() => setNavToggle(current => !current)} className={styles.navBarToggler}>Hello</button> */}
            <DashboardNav className={navToggle ? '' : styles.navBarHidden} />
            {children}
        </div>
    )
}