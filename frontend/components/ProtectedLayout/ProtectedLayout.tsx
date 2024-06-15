"use client"

import { ReactNode } from "react"

import ProtectedNavbar from "../ProtectedNavbar/ProtectedNavbar"
import ProtectedHeader from "../ProtectedHeader/ProtectedHeader"
import DashboardDataProvider, { DashboardDataProviderProps } from "../DashboardDataProvider/DashboardDataProvider"

import styles from "./ProtectedLayout.module.css"
import EntryFormPopup from "../EntryFormPopup/EntryFormPopup"
import Backdrop from "../Backdrop/Backdrop"
import useGlobalStore from "@/hooks/useGlobalStore"

interface ProtectedLayoutProps {
    children?: ReactNode,
    contextValue: DashboardDataProviderProps["value"]
}

function NewEntryForm() {
    const isEntryFormToggled = useGlobalStore(state => state.isEntryFormToggled)
    const closeBackdrop = useGlobalStore(state => state.closeBackdrop)
    
    return (
        <EntryFormPopup 
            type="NEW_ENTRY"
            isPopupVisible={isEntryFormToggled}
            showPopupCallback={closeBackdrop}
        />
    )
}

export default function ProtectedLayout(props: ProtectedLayoutProps) {
    const toggleBackdrop = useGlobalStore((state) => state.toggleBackdrop)
    const toggleEntryForm = useGlobalStore((state) => state.toggleEntryForm)
    const addBackdropCallback = useGlobalStore((state) => state.addBackdropCallback)

    return (
        <DashboardDataProvider value={props.contextValue}>
            <div className={styles["outer-container"]}>
                <ProtectedNavbar />
                <main className={styles["main-element"]}>
                    <ProtectedHeader className={styles["header"]} />
                    
                    {/* Content container */}
                    <div className={styles["content-container"]}>
                        {props.children}
                    </div>
                    <button 
                        className={styles["entry-form-toggler"]}
                        onClick={(e) => {
                            addBackdropCallback(() => toggleEntryForm(false))
                            toggleBackdrop(true)
                            toggleEntryForm(true)
                        }}
                    >
                        <span>+</span>
                    </button>
                </main>

                {/* New Entry Form */}
                <NewEntryForm />
                <Backdrop />
            </div>
        </DashboardDataProvider>
    )
}
