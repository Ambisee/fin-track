"use client"

import EntryForm from "../EntryForm/EntryForm"
import CrossButton from "../CrossButton/CrossButton"
import ActionButton from "../ActionButton/ActionButton"
import { Entry } from "@/supabase"

import styles from "./EntryFormPopup.module.css"

type EntryFormPopupProps = {
    showPopupCallback: () => void,
    isPopupVisible: boolean,
} & ({type: "EDIT_ENTRY", values?: Entry} | {type: "NEW_ENTRY"})

export default function EntryFormPopup({
    showPopupCallback,
    isPopupVisible,
    ...props
}: EntryFormPopupProps) {
    let entryForm
    if (props.type === "EDIT_ENTRY") {
        entryForm = (
            <EntryForm 
                title="Edit Entry"
                id="edit-entry-form"
                type={props.type}
                values={props.values}
            />
        )
    } else {
        entryForm = (
            <EntryForm 
                title="New Entry"
                id="new-entry-form"
                type={props.type}
            />
        )
    }

    return (
        <div
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Escape") {
                    showPopupCallback()
                }
            }}
            className={`
                popup
                ${styles["entry-form-container"]}
                ${isPopupVisible && styles["visible"]}
            `}
        >
            <div className={styles["entry-form-header"]}>
                <CrossButton
                    className={styles["entry-form-close-button"]}
                    onClick={() => {
                        showPopupCallback()
                    }}
                />
            </div>
            {entryForm}
            <div>
                <ActionButton
                    className={styles["bottom-close-button"]}
                    onClick={() => {
                        showPopupCallback()
                    }}
                >
                    Close
                </ActionButton>
            </div>
        </div>
    )
}