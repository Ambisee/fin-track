"use client"

import EntryList from "@/components/user/EntryList"
import {
	useInfiniteEntryDataQuery,
	useSettingsQuery
} from "../../../../lib/hooks"
import { useState } from "react"

export default function DashboardTest() {
	const [cursorIndex, setCursorIndex] = useState(0)

	const settingsQuery = useSettingsQuery()
	const entryQuery = useInfiniteEntryDataQuery(
		settingsQuery.data?.data?.current_ledger,
		new Date("2025-02-25"),
		5
	)

	return (
		<div>
			<div className="h-20">
				<input
					className="block"
					type="number"
					value={cursorIndex}
					onChange={(e) => setCursorIndex(Number.parseInt(e.target.value))}
				/>
				<button
					type="button"
					onClick={(e) => {
						e.preventDefault()
						entryQuery.refetch({})
					}}
				>
					Fetch Cursor Page
				</button>
				<button
					type="button"
					onClick={(e) => {
						e.preventDefault()
						entryQuery.fetchNextPage()
					}}
				>
					Fetch Next
				</button>
			</div>
			<EntryList
				onScrollToBottom={() => {
					if (entryQuery.hasNextPage) entryQuery.fetchNextPage()
				}}
				data={
					entryQuery.data?.pages
						?.map((value, index) => value.data ?? [])
						?.flatMap((value) => value) ?? []
				}
			/>
		</div>
	)
}
