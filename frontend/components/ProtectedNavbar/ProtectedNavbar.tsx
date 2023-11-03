"use client"

import Link from "next/link"

import ThemeSwitchButton from "../ThemeSwitchButton/ThemeSwitchButton"

import styles from "./ProtectedNavbar.module.css"
import CrossButton from "../CrossButton/CrossButton"
import { MouseEventHandler } from "react"
import NavTogglerButton from "../NavTogglerButton/NavTogglerButton"

interface ProtectedNavbarProps {
    className?: string,
    crossButtonClassName?: string,
    crossButtonCallback: MouseEventHandler<HTMLButtonElement>
}

export default function ProtectedNavbar(props: ProtectedNavbarProps) {
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
                        <Link href="#">Home</Link>
                    </li>
                    <li className={styles["nav-item"]}>
                        <Link href="#">Settings</Link>
                    </li>
                    <li className={styles["nav-item"]}>
                        <Link href="#">Entries</Link>
                    </li> 
                    <li className={styles["nav-item"]}>
                        <Link href="#">Analytics</Link>
                    </li> 
                </ul>
            </nav>
        </div>
    )
}