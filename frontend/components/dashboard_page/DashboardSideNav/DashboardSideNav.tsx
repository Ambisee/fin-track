import Link from "next/link"
import { CSSProperties } from "react"
import { useRouter } from "next/router"

import { useDashboardContext } from '../context'
import { HOVER, REDIRECT } from "../constants"

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
for (let i = 0; i < linkObjects.length; i++) {
    variants[i] = {y: `${i * linkHeight}rem`, rotation: 0.02}
}

/**
 * Part of the dashboard's navigation bar. Contains links
 * for redirecting the user within the dashboard
 * 
 * @param props Properties to be passed to the component 
 * @param props.className Additional CSS class to be added to the current component's parent element
 * @param props.onRedirect Callback function to be called when a link has been pressed
 * 
 * @return
 */
export default function DashboardSideNav(
    props: {
        className: string, 
        onRedirect: () => void
    }
) : JSX.Element {
    const {
        className, 
        onRedirect
    } = props

    /**
     * router: ~ =
     *      NextJS router hook
     */
    const router = useRouter()
    const { state, dispatch } = useDashboardContext()

    return (
        <nav className={`${styles.dashboardNav} ${className}`}>
            <h3 
                style={{cursor: 'pointer'}}
                onClick={() => {
                    router.push('/dashboard')
                    dispatch({type: REDIRECT, value: 0})
                    dispatch({type: HOVER, value: 0})
                }}
            >
                FinTrack
            </h3>
            <ul 
                className={styles.links} 
                style={{'--link-height': `${linkHeight}rem`} as CSSProperties}
            >
                {/* Rendering elements from the `linkObjects` Object */}
                {linkObjects.map((obj, index) => (
                        <li key={index}>
                            <Link href={obj.url} passHref>
                                <a
                                    onClick={() => {
                                        dispatch({type: REDIRECT, value: index})
                                        dispatch({type: HOVER, value: index})
                                        onRedirect()
                                    }}
                                    onMouseEnter={(e) => {
                                        dispatch({type: HOVER, value: index})
                                    }}
                                    onMouseLeave={(e) => {
                                        dispatch({type: HOVER, value: state.currentPage})
                                    }}
                                    className={`
                                        ${styles.link}
                                        ${index == state.currentPage && styles.currentPage}
                                        ${index == state.currentPage && state.hoverIndex != index ? styles.notHovered : ""}
                                    `}
                                >
                                    <span>{obj.name}</span>
                                </a>
                            </Link>
                        </li>
                    )
                )}

                {/* The highlight element for hover animation */}
                <div
                    className={styles.linkHighlight}
                    style={{transform: `translateY(${state.hoverIndex * linkHeight}rem)`}}
                />
            </ul>
        </nav>
    )
}
