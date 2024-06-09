"use client"

import EntryForm from "../EntryForm/EntryForm"
import CrossButton from "../CrossButton/CrossButton"
import ActionButton from "../ActionButton/ActionButton"
import { Entry } from "@/supabase"

import styles from "./EntryFormPopup.module.css"

type EntryFormPopupProps = {
    showPopupCallback: (arg0: boolean) => void,
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
 
    let entryFormProps = { type: props.type, values: undefined, title: "", id: "" }
    
    if (props.type === "EDIT_ENTRY") {
        entryFormProps.values = props.values as any
        entryFormProps.title = "Edit Entry"
        entryFormProps.id = "edit-entry-form"
    } else {
        entryFormProps.title = "New Entry"
        entryFormProps.id = "new-entry-form"
    }
    
    
    return (
        <div
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Escape") {
                    showPopupCallback(false)
                }
            }}
            className={`
                ${styles["entry-form-container"]}
                ${isPopupVisible && styles["visible"]}
            `}
        >
            <div className={styles["entry-form-header"]}>
                <CrossButton
                    className={styles["entry-form-close-button"]}
                    onClick={() => {
                        showPopupCallback(false)
                    }}
                />
            </div>
            {entryForm}
            <ActionButton
                className={styles["bottom-close-button"]}
                onClick={() => {
                    showPopupCallback(false)
                }}
            >
                Close
            </ActionButton>
        </div>
    )
}