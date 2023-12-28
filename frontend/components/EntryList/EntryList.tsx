"use client"

import { useRef, useState } from "react"

import Checkbox from "../Checkbox/Checkbox"
import EntryListItem from "../EntryListItem/EntryListItem"
import { Entry } from "@/supabase"
import { sbClient } from "@/supabase/supabase_client"

import styles from "./EntryList.module.css"

interface EntryListProps {
	title?: string,
	description?: string,
	className?: string,
	editButtonCallback?: (data: Entry) => void, 
	data: Entry[]
}

const selectedIds = new Set<number>()

export default function EntryList(props: EntryListProps) {
	const selectedIdsRef = useRef(selectedIds)
	const [isSelectedList, setIsSelectedList] = useState(
		Array(props.data.length).fill(false)
	)

	const createRemoveFromSelectedCallback = (id: number, compIndex: number) => {
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

	const createAddToSelectedCallback = (id: number, compIndex: number) => {
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
		sbClient
            .from("entry")
            .delete()
            .in("id", Array.from(selectedIdsRef.current))
            .then((data) => {
                if (data.error) {
                    alert(data.error)
                    return
                }

                setIsSelectedList(Array(props.data.length).fill(false))
                selectedIdsRef.current.clear()
                
                alert("Successfully deleted the entries.")
            })
	}

	return (
		<>
			<div className={styles["list-header"]}>
				<h3 className={styles["list-title"]}>{props.title}</h3>
				<div className={styles["header-left"]}>
					<button
						className={`
                            ${styles["delete-selected-button"]}
                            ${(selectedIdsRef.current.size !== 0) && styles["visible"]}
                        `}
                        onClick={() => {
                            if (confirm("Would you like to delete the selected entries ?")) {
                                deleteEntries()
                            }
                        }}
					>
						<svg
							className={styles["trash-can-icon"]}
							version="1.1"
							xmlns="http://www.w3.org/2000/svg"
							xmlnsXlink="http://www.w3.org/1999/xlink"
							viewBox="0 0 41.336 41.336"
							xmlSpace="preserve"
						>
							<g>
								<path
									d="M36.335,5.668h-8.167V1.5c0-0.828-0.672-1.5-1.5-1.5h-12c-0.828,0-1.5,0.672-1.5,1.5v4.168H5.001c-1.104,0-2,0.896-2,2
                                    s0.896,2,2,2h2.001v29.168c0,1.381,1.119,2.5,2.5,2.5h22.332c1.381,0,2.5-1.119,2.5-2.5V9.668h2.001c1.104,0,2-0.896,2-2
                                    S37.438,5.668,36.335,5.668z M14.168,35.67c0,0.828-0.672,1.5-1.5,1.5s-1.5-0.672-1.5-1.5v-21c0-0.828,0.672-1.5,1.5-1.5
                                    s1.5,0.672,1.5,1.5V35.67z M22.168,35.67c0,0.828-0.672,1.5-1.5,1.5s-1.5-0.672-1.5-1.5v-21c0-0.828,0.672-1.5,1.5-1.5
                                    s1.5,0.672,1.5,1.5V35.67z M25.168,5.668h-9V3h9V5.668z M30.168,35.67c0,0.828-0.672,1.5-1.5,1.5s-1.5-0.672-1.5-1.5v-21
                                    c0-0.828,0.672-1.5,1.5-1.5s1.5,0.672,1.5,1.5V35.67z"
								/>
							</g>
						</svg>
					</button>
                    {(props.data.length > 0) &&
                        <Checkbox
                            name="select-all-checkbox"
                            checked={selectedIdsRef.current.size === props.data.length}
                            onClick={(e) => {
                                if (!e.currentTarget.checked) {
                                    setIsSelectedList(Array(props.data.length).fill(false))
                                    selectedIdsRef.current.clear()
                                } else {
                                    setIsSelectedList(Array(props.data.length).fill(true))
                                    props.data.forEach((val) => selectedIdsRef.current.add(val.id))
                                }
                            }}
                        />
                    }
				</div>
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
						selectCallback={createAddToSelectedCallback(value.id, index)}
						deselectCallback={createRemoveFromSelectedCallback(value.id, index)}
						editButtonCallback={() => {
							if (props.editButtonCallback !== undefined) {
								props.editButtonCallback(value)
							}
						}}
					/>
				))}
                {props.data.length === 0 && (
                    <div className={styles["empty-list-message-container"]}>
                        <h1 className={styles["empty-list-header"]}>Nothing here yet</h1>
                        <p className={styles["empty-list-description"]}>
                            The entries with the most recent date value specified will appear here.
                        </p>
                    </div>
                )}
			</ul>
		</>
	)
}
