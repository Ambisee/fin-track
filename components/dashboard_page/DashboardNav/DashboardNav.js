import Link from "next/link"
import { motion } from "framer-motion"

import styles from './DashboardNav.module.css'
import { useState } from "react"

const linkHeight = 3.25
const linkObjects = [
    {name: 'Home', url: '/dashboard'},
    {name: 'Account', url: '/dashboard/account'},
    {name: 'Records', url: '/dashboard/records'},
    {name: 'Analytics', url: '/dashboard/analytics'}
]

const variants = {}
for (let i = 0; i < 4; i++) {variants[i] = {y: `${i * linkHeight}rem`}}

export default function DashboardNav(props) {
    const {pageIndex} = props
    const [hoverIndex, setHoverIndex] = useState(pageIndex)

    return (
        <motion.nav className={`${styles.dashboardNav}`}>
            <h3>FinTrack</h3>
            <motion.ul className={styles.links} style={{'--link-height': `${linkHeight}rem;`}}>
                {linkObjects.map((obj, index) => (
                        <motion.li 
                            key={index}
                            onHoverStart={() => setHoverIndex(index)}
                            onHoverEnd={() => setHoverIndex(pageIndex)}
                        >
                            <Link href={obj.url} passHref
                            >
                                <a className={styles.link}>
                                    <span>{obj.name}</span>
                                </a>
                            </Link>
                        </motion.li>
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
