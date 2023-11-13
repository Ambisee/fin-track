"use client"

import { ReactNode, useState, useRef } from "react"

import ProtectedNavbar from "../ProtectedNavbar/ProtectedNavbar"
import ProtectedHeader from "../ProtectedHeader/ProtectedHeader"

import styles from "./ProtectedLayout.module.css"
import EntryForm from "../EntryForm/EntryForm"
import CrossButton from "../CrossButton/CrossButton"

interface ProtectedLayoutProps {
    children?: ReactNode
}

export default function ProtectedLayout(props: ProtectedLayoutProps) {
    const [isNavToggled, setIsNavToggled] = useState(false)
    const [isDropdownToggled, setIsDropdownToggled] = useState(false)
    const [isEntryFormToggled, setIsEntryFormToggled] = useState(false)

    const dropdownTogglerRef = useRef<HTMLDivElement>(null)
    
    return (
        <div 
            className={styles["outer-container"]}
            onClick={(e) => {
                if (!isDropdownToggled) {
                    return;
                }

                if (!dropdownTogglerRef.current?.contains(e.target as Node) || e.target !== dropdownTogglerRef.current) {
                    setIsDropdownToggled(false);
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
                    dropdownTogglerCallback={() => setIsDropdownToggled(cur => !cur)}
                    isDropdownVisible={isDropdownToggled}
                    navTogglerCallback={() => {setIsNavToggled(cur => !cur)}} 
                />
                
                {/* Content container */}
                <div className={styles["content-container"]}>
                    {props.children}
                </div>
                <button 
                    className={styles["entry-form-toggler"]}
                    onClick={() => {setIsEntryFormToggled(true)}}
                >
                    +
                </button>
            </main>
            <div 
                className={`
                    ${styles["entry-form-container"]}
                    ${isEntryFormToggled && styles["show"]}
                `}
            >
                <div className={styles["entry-form-header"]}>
                    <CrossButton 
                        className={styles["entry-form-close-button"]} 
                        onClick={() => setIsEntryFormToggled(false)}
                    />
                </div>
                <EntryForm title="New Entry" />
            </div>

            <div 
                onMouseDown={() => {
                    if (isNavToggled) setIsNavToggled(false)
                    if (isEntryFormToggled) setIsEntryFormToggled(false)
                }}
                className={`
                    ${styles["backdrop"]}
                    ${(isNavToggled || isEntryFormToggled) && styles["show"]}
                `}
            />
        </div>
    )
}
