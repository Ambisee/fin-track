"use client"

import { useEffect, useState } from "react"

import EntryList from "../EntryList/EntryList"
import EntryForm from "../EntryForm/EntryForm"
import CrossButton from "../CrossButton/CrossButton"
import ActionButton from "../ActionButton/ActionButton"
import { useLayout } from "../ProtectedLayoutProvider/ProtectedLayoutProvider"
import { useDashboardData } from "../DashboardDataProvider/DashboardDataProvider"
import { Entry } from "@/supabase"

import styles from "./DashboardHomeContent.module.css"
import EntryFormPopup from "../EntryFormPopup/EntryFormPopup"

export default function DashboardHomeContent() {
	const [editValues, setEditValues] = useState<Entry | undefined>(undefined)
	const [isEditFormVisible, setIsEditFormVisible] = useState(false)
	const { user, data } = useDashboardData()
	const {
		setIsEntryFormToggled,
		setIsBackdropVisible,
		setBackdropToggleCallbacks
	} = useLayout()

	useEffect(() => {
		setBackdropToggleCallbacks([() => setIsEditFormVisible(false)])

		return () => {
			setBackdropToggleCallbacks([])
		}
	}, [setBackdropToggleCallbacks])

	const toggleEntryEditForm = (data: Entry) => {
		setEditValues(data)
		setIsEditFormVisible(true)
		setIsBackdropVisible(true)
	}

	return (
		<>
			<h2 className={styles["welcome-text"]}>
				Welcome back, {user?.user_metadata.username}.
			</h2>
			<div className={styles["action-button-container"]}>
				<ActionButton
					className={styles["action-button"]}
					onClick={() => {
						setIsEntryFormToggled(true)
						setIsBackdropVisible(true)
					}}
				>
					Add a new entry
				</ActionButton>
			</div>
			<div className={styles["recent-entry-container"]}>
				<EntryList
					title="Recent entries"
					className={styles["recent-entry-list"]}
					editButtonCallback={toggleEntryEditForm}
					data={data}
				/>
			</div>
            <EntryFormPopup 
                showPopupCallback={(arg) => {
                    setIsEditFormVisible(arg)
                    setIsBackdropVisible(arg)
                }}
                isPopupVisible={isEditFormVisible}
                values={editValues}
            />
        </>
	)
}
