"use client"

import { Entry } from "@/types/supabase"
import EntryListItem from "./EntryListItem"

interface EntryListProps {
	data?: Entry[]
}

export default function EntryList(props: EntryListProps) {
	if (props.data === undefined) {
		return <div>Empty Data</div>
	}

	return (
		<div className="grid gap-4">
			{props.data.map((val) => (
				<EntryListItem key={val.id} data={val} />
			))}
		</div>
	)
}
