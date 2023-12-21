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
			<h1 className={styles["welcome-text"]}>
				Welcome back, {user?.user_metadata.username}.
			</h1>
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
			<div
				tabIndex={0}
				onKeyDown={(e) => {
					if (e.key === "Escape") {
						setIsEditFormVisible(false)
						setIsBackdropVisible(false)
					}
				}}
				className={`
                    ${styles["edit-entry-form-container"]}
                    ${isEditFormVisible && styles["visible"]}
                `}
			>
				<div className={styles["entry-form-header"]}>
					<CrossButton
						className={styles["entry-form-close-button"]}
						onClick={() => {
							setIsEditFormVisible(false)
							setIsBackdropVisible(false)
						}}
					/>
				</div>
				<EntryForm
					id="edit-values-form"
					type="EDIT_ENTRY"
					values={editValues}
					title="Edit Entry"
				/>
				<ActionButton
					className={styles["bottom-close-button"]}
					onClick={() => {
						setIsEditFormVisible(false)
						setIsBackdropVisible(false)
					}}
				>
					Close
				</ActionButton>
			</div>
		</>
	)
}
