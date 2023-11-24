"use client"

import { MouseEventHandler } from "react"
import styles from "./EntryListItem.module.css"

interface EntryListItemProps {
    buttonCallback?: MouseEventHandler<HTMLButtonElement>,
    data: {
        amount: unknown
        amount_is_positive: boolean
        created_at?: string
        created_by?: string | null
        date?: string
        description?: string | null
        id?: number
    }
}

export default function EntryListItem(props: EntryListItemProps) {
    return (
        <li className={styles["item-element"]}>
            <div className={styles["description-container"]}>
                <h4 className={styles["description-text"]}>{props.data.description}</h4>
                <span className={styles["description-date"]}>{props.data.date}</span>
            </div>
            <div className={styles["right-container"]}>
                <span 
                    className={`
                        ${styles["description-amount"]}
                        ${styles[props.data.amount_is_positive ? "plus" : "minus"]}
                    `}
                >
                    {props.data.amount_is_positive ? "+" : "-"} {props.data.amount as string}
                </span>
                
                <button className={styles["utility-button"]} onClick={props.buttonCallback}>
                    <svg className={styles["arrow-head"]} xmlns="http://www.w3.org/2000/svg" width="2000" height="2000" viewBox="0 0 2000 2000">
                        <path id="Shape_317_1" data-name="Shape 317 1" className="arrow" d="M1077.11,545.943c124.8,125.178,597.15,596.977,644.93,644.747,44.08,44.07,93.68,96.01,129.45,131.77,39.53,39.52,32.91,101.23,2.35,131.77-50.44,50.43-110.13,32.44-147.44-4.86-34.37-34.37-71.78-70.76-92.64-91.61Q1307.82,1050.71,1001.8,743.6C536.787,1208.48,350.359,1392.51,276.847,1466c-8.351,8.35-50.069,37.21-101.21,11.77-82.258-40.94-54.089-129.47-28.245-155.31,76.272-76.25,216.994-216.93,513.113-512.971,58.053-57.253,207.918-208.646,265.971-265.9,18.772-18.767,36.07-30.59,72.966-30.59C1031.52,513,1048.27,517.1,1077.11,545.943Z"/>
                    </svg>
                </button>
            </div>
        </li>
    )
}