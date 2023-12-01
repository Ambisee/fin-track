"use client"

import { useRef, useState } from "react"

import Checkbox from "../Checkbox/Checkbox"
import EntryListItem from "../EntryListItem/EntryListItem"
import { Entry } from "@/supabase"
import { sbClient } from "@/supabase/supabase_client"

import styles from "./EntryList.module.css"
import EntryForm from "../EntryForm/EntryForm"
import ActionButton from "../ActionButton/ActionButton"
import CrossButton from "../CrossButton/CrossButton"
import { useLayout } from "../ProtectedLayoutProvider/ProtectedLayoutProvider"

interface EntryListProps {
    title?: string,
    description?: string,
    className?: string,
    editButtonCallback?: (data: Entry) => void,
    data: Entry[],
}

const selectedIds = new Set<number>()
const selectCallbacks: (() => void)[] = []

export default function EntryList(props: EntryListProps) {
    const selectedIdsRef = useRef(selectedIds)
    const [isSelectedList, setIsSelectedList] = useState(Array(props.data.length).fill(false))
    
    const createRemoveFromSelected = (id: number, compIndex: number) => {
        return () => {
            if (isSelectedList[compIndex] === false) {
                return
            }

            setIsSelectedList((c) => {
                const newArr = [...c]
                newArr[compIndex] = false
                selectedIdsRef.current.delete(id)
                
                return newArr
            })
        }
    }

    const createAddToSelected = (id: number, compIndex: number) => {
        return () => {
            if (isSelectedList[compIndex] === true) {
                return
            }

            setIsSelectedList((c) => {
                const newArr = [...c]
                newArr[compIndex] = true
                selectedIdsRef.current.add(id)
                
                return newArr
            })
        }
    }

    const deleteEntries = async () => {
        sbClient.from("entry").delete().in("id", [])
    }

    return (
        <>
            <div className={styles["list-header"]}>
                <h3 className={styles["list-title"]}>
                    {props.title}
                </h3>
                <Checkbox 
                    onClick={(e) => {
                        if (!e.currentTarget.checked) {
                            setIsSelectedList(Array(props.data.length).fill(false))
                            selectedIdsRef.current.clear()
                        } 
                        else {
                            setIsSelectedList(Array(props.data.length).fill(true))
                            props.data.forEach((val) => selectedIdsRef.current.add(val.id))
                        }
                    }} 
                />
            </div>
            <ul 
                className={`
                    ${styles["list-element"]}
                    ${props.className}
                `}
            >
                {props.data.map((value, index) => (
                    <EntryListItem 
                        key={value.id} 
                        data={value} 
                        isSelected={isSelectedList[index]}
                        selectCallback={createAddToSelected(value.id, index)}
                        deselectCallback={createRemoveFromSelected(value.id, index)}
                        editButtonCallback={() => {
                            if (props.editButtonCallback !== undefined) {
                                props.editButtonCallback(value)
                            }
                        }}
                    />
                ))}
            </ul>
        </>
    )
}
