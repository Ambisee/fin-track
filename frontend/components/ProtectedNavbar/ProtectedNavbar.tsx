"use client"

import Link from "next/link"

import ThemeSwitchButton from "../ThemeSwitchButton/ThemeSwitchButton"
import CrossButton from "../CrossButton/CrossButton"

import styles from "./ProtectedNavbar.module.css"
import useGlobalStore from "@/hooks/useGlobalStore"

interface ProtectedNavbarProps {
    className?: string,
    crossButtonClassName?: string,
    // crossButtonCallback: MouseEventHandler<HTMLButtonElement>
}

export default function ProtectedNavbar(props: ProtectedNavbarProps) {
    const toggleNav = useGlobalStore((state) => state.toggleNav)
    const toggleBackdrop = useGlobalStore((state) => state.toggleBackdrop)
    const closeBackdrop = useGlobalStore(state => state.closeBackdrop)
    
    const isNavToggled = useGlobalStore(state => state.isNavToggled)

    return (
        <div
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Escape") {
                    closeBackdrop()
                }
            }}
            className={`
                ${isNavToggled && styles["show"]}
                ${styles["nav-container"]}
            `}
        >
            <div className={styles["button-container"]}>
                <CrossButton 
                    onClick={closeBackdrop} 
                    className={`
                        ${styles["cross-button"]}
                        ${props.crossButtonClassName}
                    `} 
                />
                <ThemeSwitchButton className={styles["theme-switch-button"]} />
            </div>
            <nav className={styles["nav-element"]}>
                <ul className={styles["nav-list"]}>
                    <li className={styles["nav-item"]}>
                        <Link 
                            href="/dashboard"
                            onClick={() => {
                                toggleNav(false)
                                toggleBackdrop(false)
                            }} 
                        >
                            Home
                        </Link>
                    </li>
                    <li className={styles["nav-item"]}>
                        <Link 
                            href="/dashboard/settings"
                            onClick={() => {
                                toggleNav(false)
                                toggleBackdrop(false)
                            }}
                        >
                            Settings
                        </Link>
                    </li>
                    <li className={styles["nav-item"]}>
                        <Link 
                            href="/dashboard/entries"
                            onClick={() => {
                                toggleNav(false)
                                toggleBackdrop(false)
                            }} 
                        >
                            Entries
                        </Link>
                    </li> 
                    <li className={styles["nav-item"]}>
                        <Link 
                            onClick={() => {
                                toggleNav(false)
                                toggleBackdrop(false)
                            }} 
                            href="/dashboard/analytics"
                        >
                            Analytics
                        </Link>
                    </li> 
                </ul>
            </nav>
        </div>
    )
}