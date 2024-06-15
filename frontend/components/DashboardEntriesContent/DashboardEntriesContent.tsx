"use client"

import { useState, useEffect, useMemo } from "react"

import { Entry } from "@/supabase"
import { sortDataByGroup } from "@/helpers/data_helper"
import { useDashboardData } from "../DashboardDataProvider/DashboardDataProvider"
import EntryList from "../EntryList/EntryList"

import styles from "./DashboardEntriesContent.module.css"
import EntryFormPopup from "../EntryFormPopup/EntryFormPopup"
import useGlobalStore from "@/hooks/useGlobalStore"

export default function DashboardEntriesContent() {
    const { data } = useDashboardData()
    
    const toggleBackdrop = useGlobalStore(state => state.toggleBackdrop)
    const addBackdropCallback = useGlobalStore(state => state.addBackdropCallback)
    const closeBackdrop = useGlobalStore(state => state.closeBackdrop)

    const [editValues, setEditValues] = useState<Entry | undefined>(undefined)
    const [isEditFormVisible, setIsEditFormVisible] = useState<boolean>(false)
    
    useEffect(() => {
		addBackdropCallback(() => setIsEditFormVisible(false))
	}, [addBackdropCallback])

    const tables = useMemo(() => {
        const toggleEntryEditForm = (data: Entry) => {
            setEditValues(data)
            toggleBackdrop(true)
            setIsEditFormVisible(true)

            addBackdropCallback(() => setEditValues(undefined))
            addBackdropCallback(() => setIsEditFormVisible(false))
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
    }, [data, toggleBackdrop, addBackdropCallback])

    return (
        <>
            <h2 className={styles["page-title"]}>Entries</h2>
            {tables}
            <EntryFormPopup 
                type="EDIT_ENTRY"
                showPopupCallback={() => closeBackdrop()}
                isPopupVisible={isEditFormVisible}
                values={editValues}
            />
        </>
    )
}