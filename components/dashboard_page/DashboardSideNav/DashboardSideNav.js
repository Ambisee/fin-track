import Link from "next/link"
import { motion } from "framer-motion"
import { useState, useRef } from "react"

import styles from './DashboardSideNav.module.css'

const linkHeight = 3.25
const linkObjects = [
    {name: 'Home', url: '/dashboard'},
    {name: 'Account', url: '/dashboard/account'},
    {name: 'Records', url: '/dashboard/records'},
    {name: 'Analytics', url: '/dashboard/analytics'}
]

const variants = {}
for (let i = 0; i < 4; i++) {variants[i] = {y: `${i * linkHeight}rem`}}

export default function DashboardSideNav(props) {
    const {pageIndex, className} = props
    const [hoverIndex, setHoverIndex] = useState(pageIndex)
    const currentPageRef = useRef()

    return (
        <motion.nav className={`${styles.dashboardNav} ${className}`}>
            <h3>FinTrack</h3>
            <motion.ul className={styles.links} style={{'--link-height': `${linkHeight}rem`}}>
                {linkObjects.map((obj, index) => (
                        <li key={index}>
                            <Link href={obj.url} passHref>
                                <motion.a
                                    ref={pageIndex == index && currentPageRef} 
                                    onHoverStart={() => {
                                        setHoverIndex(index)
                                        if (!(pageIndex == index)) currentPageRef.current.style.color = 'white'
                                    }}
                                    onHoverEnd={() => {setHoverIndex(pageIndex); currentPageRef.current.style.color = ''}}
                                    className={`
                                        ${styles.link}
                                        ${index == pageIndex && styles.currentPage}
                                    `}
                                >
                                    <span>{obj.name}</span>
                                </motion.a>
                            </Link>
                        </li>
                    )
                )}
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
