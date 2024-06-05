"use client"

import { useState, useEffect, useMemo } from "react"

import { Entry } from "@/supabase"
import { sortDataByGroup } from "@/helpers/data_helper"
import { useDashboardData } from "../DashboardDataProvider/DashboardDataProvider"
import { useLayout } from "../ProtectedLayoutProvider/ProtectedLayoutProvider"
import EntryList from "../EntryList/EntryList"

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


    const tables = useMemo(() => {
        const toggleEntryEditForm = (data: Entry) => {
            setEditValues(data)
            setIsBackdropVisible(true)
            setIsEditFormVisible(true)
        }

        return sortDataByGroup(data).map((value) => {
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
        })
    }, [data, setIsBackdropVisible])

    return (
        <>
            <h2 className={styles["page-title"]}>Entries</h2>
            {tables}
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