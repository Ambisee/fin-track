"use client"

import Link from "next/link"
import { MouseEventHandler } from "react"

import ThemeSwitchButton from "../ThemeSwitchButton/ThemeSwitchButton"
import CrossButton from "../CrossButton/CrossButton"
import NavTogglerButton from "../NavTogglerButton/NavTogglerButton"
import { useLayout } from "../ProtectedLayoutProvider/ProtectedLayoutProvider"

import styles from "./ProtectedNavbar.module.css"

interface ProtectedNavbarProps {
    className?: string,
    crossButtonClassName?: string,
    crossButtonCallback: MouseEventHandler<HTMLButtonElement>
}

export default function ProtectedNavbar(props: ProtectedNavbarProps) {
    const { setIsNavToggled } = useLayout()
    
    return (
        <div 
            className={`
                ${styles["nav-container"]}
                ${props.className}
            `}
        >
            <div className={styles["button-container"]}>
                <CrossButton 
                    onClick={props.crossButtonCallback} 
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
                        <Link onClick={() => {setIsNavToggled(false)}} href="/dashboard">Home</Link>
                    </li>
                    <li className={styles["nav-item"]}>
                        <Link onClick={() => {setIsNavToggled(false)}} href="/dashboard/settings">Settings</Link>
                    </li>
                    <li className={styles["nav-item"]}>
                        <Link onClick={() => {setIsNavToggled(false)}} href="#">Entries</Link>
                    </li> 
                    <li className={styles["nav-item"]}>
                        <Link onClick={() => {setIsNavToggled(false)}} href="#">Analytics</Link>
                    </li> 
                </ul>
            </nav>
        </div>
    )
}