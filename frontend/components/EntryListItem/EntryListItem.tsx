"use client"

import { MouseEventHandler, Ref, useEffect, useState } from "react"

import Checkbox from "../Checkbox/Checkbox"
import { Entry } from "@/supabase"

import styles from "./EntryListItem.module.css"
import ActionButton from "../ActionButton/ActionButton"

interface EntryListItemProps {
	data: Entry 
	isSelected: boolean
    isSelectMode: boolean
	selectCallback: any
	deselectCallback: any
    deleteButtonCallback: MouseEventHandler<HTMLButtonElement>
	editButtonCallback?: MouseEventHandler<HTMLButtonElement>
}

export default function EntryListItem(props: EntryListItemProps) {

	return (
		<li
            onClick={(e) => {
                if (props.isSelected) {
                    props.deselectCallback()
                    return
                } else {
                    props.selectCallback()
                }
            }}
			className={`
                ${styles["item-element"]}
                ${props.isSelectMode && styles["select-mode"]}
                ${(props.isSelectMode && props.isSelected) && styles["selected"]}
                ${(!props.isSelectMode && props.isSelected) && styles["toggled"]}
            `}
		>
            <div className={styles["content-view"]}>
                <div className={styles["item-view"]}>
                    <div className={styles["description-container"]}>
                        <h4 className={styles["description-text"]}>{props.data.title}</h4>
                        <span className={styles["description-date"]}>{props.data.date}</span>
                    </div>
                    <div className={styles["right-container"]}>
                        <span
                            className={`
                                ${styles["description-amount"]}
                                ${
                                    styles[
                                        props.data.amount_is_positive ? "plus" : "minus"
                                    ]
                                }
                            `}
                        >
                            {props.data.amount_is_positive ? "+" : "-"}{" "}
                            {props.data.amount as string}
                        </span>
                    </div>
                    
                    {/* <div
                        className={`
                            ${styles["widget-container"]}
                        `}
                    >
                        <button
                            className={styles["edit-button"]}
                            onClick={(e) => {
                                e.stopPropagation()
                                props?.editButtonCallback?.(e)
                            }}
                        >
                            <svg
                                className={styles["edit-icon"]}
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <g />
                                <g />
                                <g>
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M20.8477 1.87868C19.6761 0.707109 17.7766 0.707105 16.605 1.87868L2.44744 16.0363C2.02864 16.4551 1.74317 16.9885 1.62702 17.5692L1.03995 20.5046C0.760062 21.904 1.9939 23.1379 3.39334 22.858L6.32868 22.2709C6.90945 22.1548 7.44285 21.8693 7.86165 21.4505L22.0192 7.29289C23.1908 6.12132 23.1908 4.22183 22.0192 3.05025L20.8477 1.87868ZM18.0192 3.29289C18.4098 2.90237 19.0429 2.90237 19.4335 3.29289L20.605 4.46447C20.9956 4.85499 20.9956 5.48815 20.605 5.87868L17.9334 8.55027L15.3477 5.96448L18.0192 3.29289ZM13.9334 7.3787L3.86165 17.4505C3.72205 17.5901 3.6269 17.7679 3.58818 17.9615L3.00111 20.8968L5.93645 20.3097C6.13004 20.271 6.30784 20.1759 6.44744 20.0363L16.5192 9.96448L13.9334 7.3787Z"
                                    />
                                </g>
                            </svg>
                        </button>
                        <Checkbox
                            className={styles["checkbox"]}
                            checked={props.isSelected ?? false}
                            onChange={() => {
                                if (props.isSelected) {
                                    props.deselectCallback()
                                } else {
                                    props.selectCallback()
                                }
                            }}
                        />
                    </div> */}
                    <svg className={`${styles["arrow-head-icon"]}`} xmlns="http://www.w3.org/2000/svg" 
                        width="2000" height="2000" viewBox="0 0 2000 2000" fill="white"
                    >
                        <path id="Shape_317_1" data-name="Shape 317 1" className="arrow" d="M1077.11,545.943c124.8,125.178,597.15,596.977,644.93,644.747,44.08,44.07,93.68,96.01,129.45,131.77,39.53,39.52,32.91,101.23,2.35,131.77-50.44,50.43-110.13,32.44-147.44-4.86-34.37-34.37-71.78-70.76-92.64-91.61Q1307.82,1050.71,1001.8,743.6C536.787,1208.48,350.359,1392.51,276.847,1466c-8.351,8.35-50.069,37.21-101.21,11.77-82.258-40.94-54.089-129.47-28.245-155.31,76.272-76.25,216.994-216.93,513.113-512.971,58.053-57.253,207.918-208.646,265.971-265.9,18.772-18.767,36.07-30.59,72.966-30.59C1031.52,513,1048.27,517.1,1077.11,545.943Z"/>
                    </svg>
                </div>
                <div 
                    className={styles["control-buttons"]}
                >
                    <ActionButton className={`${styles["control-button"]} ${styles["edit"]}`}
                        onClick={(e) => {
                            e.stopPropagation()
                            if (props.editButtonCallback !== undefined) {
                                props.editButtonCallback(e)
                            }
                        }}
                    >
                        Edit
                    </ActionButton>
                    <ActionButton className={`${styles["control-button"]} ${styles["delete"]}`}
                        onClick={(e) => {
                            e.stopPropagation()
                            if (!confirm("Confirm deletion of this entry?")) return
                            if (props.deleteButtonCallback !== undefined) {
                                props.deleteButtonCallback(e)
                            }
                        }}
                    >
                        Delete
                    </ActionButton>
                </div>
            </div>
		</li>
	)
}
