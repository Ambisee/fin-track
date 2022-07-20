/**
 * components/dashboard_page/DashboardSideNav/DashboardSideNav.js
 * 
 * Part of the dashboard's navigation bar. Contains links
 * for redirecting the user within the dashboard
 */

import Link from "next/link"
import { motion } from "framer-motion"
import { useState, useRef } from "react"

import styles from './DashboardSideNav.module.css'

/** Navigation link's container height */
const linkHeight = 3.25
/** Data about each navigation link */
const linkObjects = [
    {name: 'Home', url: '/dashboard'},
    {name: 'Account', url: '/dashboard/account'},
    {name: 'Records', url: '/dashboard/records'},
    {name: 'Analytics', url: '/dashboard/analytics'}
]

/** Highlight element's variants.
 *  Each variant represents which link is being currently being hovered
 */
const variants = {}
for (let i = 0; i < 4; i++) {variants[i] = {y: `${i * linkHeight}rem`}}

export default function DashboardSideNav(props) {
    /**
     * pageIndex: Number =
     *      integer value indicating the initial page that the user navigated to in the dashboard
     * className: String =
     *      additional CSS class to be added to the current component's parent element
     * onRedirect: Function =
     *      callback function to be called when a link has been pressed
     */
    const {pageIndex, className, onRedirect} = props

    /**
     * currentPageIndex: Number = 
     *      integer representing the current page or url the user is in
     * hoverIndex: Number = 
     *      integer representing the currently hovered link
     */
    const [currentPageIndex, setCurrentPageIndex] = useState(pageIndex)
    const [hoverIndex, setHoverIndex] = useState(currentPageIndex)

    return (
        <motion.nav className={`${styles.dashboardNav} ${className}`}>
            <h3>FinTrack</h3>
            <motion.ul className={styles.links} style={{'--link-height': `${linkHeight}rem`}}>
                {/* Rendering elements from the `linkObjects` Object */}
                {linkObjects.map((obj, index) => (
                        <li key={index}>
                            <Link href={obj.url} passHref>
                                <motion.a
                                    onClick={() => {
                                        setCurrentPageIndex(index)
                                        onRedirect()
                                    }}
                                    onHoverStart={() => {
                                        setHoverIndex(index)
                                    }}
                                    onHoverEnd={() => {
                                        setHoverIndex(currentPageIndex)
                                    }}
                                    className={`
                                        ${styles.link}
                                        ${index == currentPageIndex && hoverIndex != index ? styles.notHovered : ""}
                                        ${index == currentPageIndex && styles.currentPage}
                                    `}
                                >
                                    <span>{obj.name}</span>
                                </motion.a>
                            </Link>
                        </li>
                    )
                )}

                {/* The highlight element for hover animation */}
                <motion.div
                    className={styles.linkHighlight}
                    variants={variants}
                    initial={{x: 0, y: 0}}
                    transition={{type: 'spring', bounce: 0, duration: 0.375}}
                    animate={variants[hoverIndex]}
                />
            </motion.ul>
        </motion.nav>
    )
}
