"use client"

import { ReactNode, useState, useRef } from "react"

import ProtectedNavbar from "../ProtectedNavbar/ProtectedNavbar"
import ProtectedHeader from "../ProtectedHeader/ProtectedHeader"

import styles from "./ProtectedLayout.module.css"

interface ProtectedLayoutProps {
    children: ReactNode
}

export default function ProtectedLayout(props: ProtectedLayoutProps) {
    const [isNavToggled, setIsNavToggled] = useState(false)
    const dropdownTogglerRef = useRef<HTMLDivElement>(null)
    const [isDropdownVisible, setIsDropdownVisible] = useState(false)
    
    return (
        <div 
            className={styles["outer-container"]}
            onClick={(e) => {
                if (!isDropdownVisible) {
                    return;
                }

                if (!dropdownTogglerRef.current?.contains(e.target as Node) || e.target !== dropdownTogglerRef.current) {
                    setIsDropdownVisible(false);
                }
            }}
        >
            <div className={styles["nav-container"]}>
                <ProtectedNavbar 
                    crossButtonCallback={() => {setIsNavToggled(cur => !cur)}} 
                    crossButtonClassName={styles["cross-button"]}
                    className={`
                        ${styles["nav-bar"]}
                        ${isNavToggled && styles["show"]}
                    `} 
                />
            </div>
            <main className={styles["main-element"]}>
                <ProtectedHeader 
                    className={styles["header"]}
                    togglerClassName={styles["nav-toggler-button"]}
                    dropdownTogglerRef={dropdownTogglerRef}
                    dropdownTogglerCallback={() => setIsDropdownVisible(cur => !cur)}
                    isDropdownVisible={isDropdownVisible}
                    navTogglerCallback={() => {setIsNavToggled(cur => !cur)}} 
                />
                <div className={styles["content-container"]}>
                    {props.children}
                </div>
            </main>
            <div 
                onMouseDown={() => {setIsNavToggled(cur => !cur)}}
                className={`
                    ${styles["backdrop"]}
                    ${isNavToggled && styles["show"]}
                `}
            />
        </div>
    )
}
