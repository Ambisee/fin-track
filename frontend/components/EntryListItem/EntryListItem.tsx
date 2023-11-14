"use client"

import styles from "./EntryListItem.module.css"

interface EntryListItemProps {
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
                <h3>{props.data.description}</h3>
                <span>{props.data.date}</span>
            </div>
            <div className={styles["amount-container"]}>
                <span>${props.data.amount as string}</span>
            </div>
            <div className={styles["edit-button"]}>
                
            </div>
        </li>
    )
}