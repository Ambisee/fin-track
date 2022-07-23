/**
 * components/dashboard_page/DashboardSideNav/DashboardSideNav.js
 * 
 * Part of the dashboard's navigation bar. Contains links
 * for redirecting the user within the dashboard
 */

import Link from "next/link"
import { motion } from "framer-motion"

import { HOVER, REDIRECT } from "../dispatcher"

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
     *      the index number that corresponds to the current page
     * className: String =
     *      additional CSS class to be added to the current component's parent element
     * onRedirect: Function =
     *      callback function to be called when a link has been pressed
     * pageState: Object =
     *      state Object that keeps track of the current page and hovered link
     * pageDispatch: Function =
     *      dispatch function used to change the values of `pageState`
     */
    const {
        pageIndex,
        className, 
        onRedirect,
        pageState,
        pageDispatch
    } = props


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
                                        pageDispatch({type: REDIRECT, index: index})
                                        pageDispatch({type: HOVER, index: index})
                                        onRedirect()
                                    }}
                                    onHoverStart={() => {
                                        pageDispatch({type: HOVER, index: index})
                                    }}
                                    onHoverEnd={() => {
                                        pageDispatch({type: HOVER, index: pageState.currentPage})
                                    }}
                                    className={`
                                        ${styles.link}
                                        ${index == pageState.currentPage && pageState.hoverIndex != index ? styles.notHovered : ""}
                                        ${index == pageState.currentPage && styles.currentPage}
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
                    animate={variants[pageState.hoverIndex]}
                />
            </motion.ul>
        </motion.nav>
    )
}
