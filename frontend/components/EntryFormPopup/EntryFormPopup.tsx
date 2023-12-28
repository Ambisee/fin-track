"use client"

import EntryForm from "../EntryForm/EntryForm"
import CrossButton from "../CrossButton/CrossButton"
import ActionButton from "../ActionButton/ActionButton"
import { Entry } from "@/supabase"

import styles from "./EntryFormPopup.module.css"

interface EntryFormPopupProps {
    showPopupCallback: (arg0: boolean) => void,
    isPopupVisible: boolean,
    values: Entry | undefined
}

export default function EntryFormPopup({
    showPopupCallback,
    isPopupVisible,
    values
}: EntryFormPopupProps) {
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
				<EntryForm
					id="edit-values-form"
					type="EDIT_ENTRY"
					values={values}
					title="Edit Entry"
				/>
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