"use client"

import EntryListItem from "../EntryListItem/EntryListItem"
import styles from "./EntryList.module.css"

interface EntryListProps {
    data: {
        amount: unknown
        amount_is_positive: boolean
        created_at?: string
        created_by?: string | null
        date?: string
        description?: string | null
        id?: number
    }[]
}

export default function EntryList(props: EntryListProps) {
    return (
        <ul className={styles["list-element"]}>
            {props.data.map((value) => (<EntryListItem key={value.id} data={value}/>))}
        </ul>
    )
}
