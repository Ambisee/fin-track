"use client"

import { useState } from "react"

import EntryList from "../EntryList/EntryList"
import { useDashboardData } from "../DashboardDataProvider/DashboardDataProvider"
import { Entry } from "@/supabase"

import styles from "./DashboardHomeContent.module.css"
import EntryFormPopup from "../EntryFormPopup/EntryFormPopup"
import useGlobalStore from "@/hooks/useGlobalStore"

export default function DashboardHomeContent() {
	const [editValues, setEditValues] = useState<Entry | undefined>(undefined)
    const [isEditFormVisible, setIsEditFormVisible] = useState(false)
	const { user, data } = useDashboardData()
	    
    const toggleBackdrop = useGlobalStore(state => state.toggleBackdrop)
    const closeBackdrop = useGlobalStore(state => state.closeBackdrop)
    const addBackdropCallback = useGlobalStore(state => state.addBackdropCallback)

	const toggleEntryEditForm = (data: Entry) => {
        setEditValues(data)
		toggleBackdrop(true)
        setIsEditFormVisible(true)
        addBackdropCallback(() => setIsEditFormVisible(false))
        addBackdropCallback(() => setEditValues(undefined))
	}

	return (
		<>
			<h2 className={styles["welcome-text"]}>
				Welcome back, {user?.user_metadata.username}.
			</h2>
			<div className={styles["recent-entry-container"]}>
				<EntryList
					title="Recent entries"
					className={styles["recent-entry-list"]}
					editButtonCallback={toggleEntryEditForm}
					data={data}
				/>
			</div>
            <EntryFormPopup
                type="EDIT_ENTRY"
                showPopupCallback={() => {
                    closeBackdrop()
                }}
                isPopupVisible={isEditFormVisible}
                values={editValues}
            />
        </>
	)
}
