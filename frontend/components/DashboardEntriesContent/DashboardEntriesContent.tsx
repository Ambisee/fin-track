"use client"

import { useState, useEffect } from "react"

import { Entry } from "@/supabase"
import { sortDataByGroup } from "@/helpers/data_helper"
import { useDashboardData } from "../DashboardDataProvider/DashboardDataProvider"
import { useLayout } from "../ProtectedLayoutProvider/ProtectedLayoutProvider"
import EntryList from "../EntryList/EntryList"
import ActionButton from "../ActionButton/ActionButton"
import CrossButton from "../CrossButton/CrossButton"
import EntryForm from "../EntryForm/EntryForm"

import styles from "./DashboardEntriesContent.module.css"
import EntryFormPopup from "../EntryFormPopup/EntryFormPopup"

export default function DashboardEntriesContent() {
    const { data } = useDashboardData()
    const { setIsBackdropVisible, setBackdropToggleCallbacks } = useLayout()
    const [editValues, setEditValues] = useState<Entry | undefined>(undefined)
    const [isEditFormVisible, setIsEditFormVisible] = useState<boolean>(false)
    
    useEffect(() => {
		setBackdropToggleCallbacks([() => setIsEditFormVisible(false)])

		return () => {
			setBackdropToggleCallbacks([])
		}
	}, [setBackdropToggleCallbacks])

    const toggleEntryEditForm = (data: Entry) => {
        setEditValues(data)
        setIsBackdropVisible(true)
        setIsEditFormVisible(true)
    }

    return (
        <>
            <h1 className={styles["page-title"]}>Entries</h1>
            {sortDataByGroup(data).map((value) => {
                return (
                    <div
                        className={styles["entry-list-wrapper"]}
                        key={value.month + `${value.year}`}
                    >
                        <EntryList 
                            className={styles["entry-list"]}
                            data={value.data}
                            title={`${value.month} ${value.year}`}
                            editButtonCallback={toggleEntryEditForm}
                        />
                    </div>
                )
            })}
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