import Link from "next/link"
import { useRouter } from "next/router"
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
    {name: 'Analytics', url: '/dashboard/analytics'},
]

/** Highlight element's variants. Each variant represents 
  * which link is being currently being hovered
  */
const variants = {}
for (let i = 0; i < linkObjects.length; i++) {variants[i] = {y: `${i * linkHeight}rem`}}

/**
 * Part of the dashboard's navigation bar. Contains links
 * for redirecting the user within the dashboard
 * 
 * @param {Object} props
 *      Properties to be passed to the component 
 * @param {String} props.className
 *      additional CSS class to be added to the current component's parent element
 * @param {Function} props.onRedirect
 *      callback function to be called when a link has been pressed
 * @param {Object} props.navState
 *      Dashboard navigation bar's `state` Object
 * @param {Function} props.navDispatch
 *      Dashboard navigation bar's `dispatch` function
 * @returns 
 */
export default function DashboardSideNav(props) {
    const {
        className, 
        onRedirect,
        navState,
        navDispatch
    } = props

    /**
     * router: ~ =
     *      NextJS router hook
     */
    const router = useRouter()

    return (
        <motion.nav className={`${styles.dashboardNav} ${className}`}>
            <h3 onClick={() => router.push('/dashboard')}>FinTrack</h3>
            <motion.ul className={styles.links} style={{'--link-height': `${linkHeight}rem`}}>
                {/* Rendering elements from the `linkObjects` Object */}
                {linkObjects.map((obj, index) => (
                        <li key={index}>
                            <Link href={obj.url} passHref>
                                <motion.a
                                    onClick={() => {
                                        navDispatch({type: REDIRECT, value: index})
                                        navDispatch({type: HOVER, value: index})
                                        onRedirect()
                                    }}
                                    onHoverStart={() => {
                                        navDispatch({type: HOVER, value: index})
                                    }}
                                    onHoverEnd={() => {
                                        navDispatch({type: HOVER, value: navState.currentPage})
                                    }}
                                    className={`
                                        ${styles.link}
                                        ${index == navState.currentPage && navState.hoverIndex != index ? styles.notHovered : ""}
                                        ${index == navState.currentPage && styles.currentPage}
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
                    animate={variants[navState.hoverIndex]}
                />
            </motion.ul>
        </motion.nav>
    )
}
