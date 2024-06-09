"use client"

import { ReactNode, useState, useRef, useEffect, useMemo, Children } from "react"

import ProtectedNavbar from "../ProtectedNavbar/ProtectedNavbar"
import ProtectedHeader from "../ProtectedHeader/ProtectedHeader"
import EntryForm from "../EntryForm/EntryForm"
import CrossButton from "../CrossButton/CrossButton"
import ActionButton from "../ActionButton/ActionButton"
import DashboardDataProvider, { DashboardDataProviderProps } from "../DashboardDataProvider/DashboardDataProvider"
import { useLayout } from "../ProtectedLayoutProvider/ProtectedLayoutProvider"

import styles from "./ProtectedLayout.module.css"
import EntryFormPopup from "../EntryFormPopup/EntryFormPopup"

interface ProtectedLayoutProps {
    children?: ReactNode,
    contextValue: DashboardDataProviderProps["value"]
}

export default function ProtectedLayout(props: ProtectedLayoutProps) {
    const dropdownTogglerRef = useRef<HTMLDivElement>(null)
    const { 
        isNavToggled, 
        setIsNavToggled,
        isDropdownToggled, 
        isBackdropVisible,
        setIsDropdownToggled,
        isEntryFormToggled, 
        setIsEntryFormToggled,
        setIsBackdropVisible,
        backdropToggleCallbacks
    } = useLayout()

    return (
        <DashboardDataProvider value={props.contextValue}>
            <div
                onKeyDown={(e) => {
                    if (e.key === "Escape") {
                        setIsBackdropVisible(false)
                        setIsEntryFormToggled(false)
                        setIsNavToggled(false)

                        for (const callback of backdropToggleCallbacks) {
                            callback()
                        }
                    }
                }}
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
                        crossButtonCallback={() => {
                            setIsNavToggled(cur => !cur)
                            setIsBackdropVisible(cur => !cur)
                        }} 
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
                        navTogglerCallback={() => {
                            setIsNavToggled(cur => !cur)
                            setIsBackdropVisible(cur => !cur)
                        }} 
                    />
                    
                    {/* Content container */}
                    <div className={styles["content-container"]}>
                        {props.children}
                    </div>
                    <button 
                        className={`
                            ${styles["entry-form-toggler"]}
                        `}
                        onClick={() => {
                            setIsEntryFormToggled(true)
                            setIsBackdropVisible(true)
                        }}
                    >
                        <span>+</span>
                    </button>
                </main>

                {/* New Entry Form */}
                <EntryFormPopup 
                    type="NEW_ENTRY"
                    isPopupVisible={isEntryFormToggled}
                    showPopupCallback={(toggle) => {
                        setIsEntryFormToggled(toggle)
                        setIsBackdropVisible(toggle)
                    }}
                />
                <div 
                    onMouseDown={() => {
                        setIsBackdropVisible(false)
                        if (isNavToggled) {
                            setIsNavToggled(false)
                        }

                        if (isEntryFormToggled) {
                            setIsEntryFormToggled(false)
                        }
                        
                        for (const callback of backdropToggleCallbacks) {
                            callback()
                        }
                    }}
                    className={`
                        ${styles["backdrop"]}
                        ${isBackdropVisible && styles["show"]}
                    `}
                />
            </div>
        </DashboardDataProvider>
    )
}
