"use client"

import { Entry } from "@/types/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Skeleton } from "../ui/skeleton"
import EntryListItem from "./EntryListItem"

interface EntryListProps {
	data?: Entry[]
	showStats?: boolean
	onEditItem?: (data: Entry) => void
}

export default function EntryList(props: EntryListProps) {
	const renderStats = () => {
		if (props.showStats === undefined || props.showStats === false) {
			return undefined
		}

		return <></>
	}

	const renderData = () => {
		if (props.data === undefined) {
			return undefined
		}

		if (props.data.length < 1) {
			return (
				<Card>
					<CardHeader>
						<CardTitle>No data provided</CardTitle>
					</CardHeader>
					<CardContent>
						Your transaction entries will be displayed here.
					</CardContent>
				</Card>
			)
		}

		return (
			<div className="grid gap-4">
				{props.data.map((val) => (
					<EntryListItem key={val.id} data={val} onEdit={props.onEditItem} />
				))}
			</div>
		)
	}

	if (props.data === undefined) {
		return (
			<div className="grid gap-4">
				<Skeleton className="w-full h-[6.25rem]" />
				<Skeleton className="w-full h-[6.25rem]" />
				<Skeleton className="w-full h-[6.25rem]" />
			</div>
		)
	}

	return (
		<div>
			{renderData()}
			{renderStats()}
		</div>
	)
}
