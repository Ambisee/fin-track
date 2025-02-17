"use client"

import { ENTRY_QKEY } from "@/lib/constants"
import useGlobalStore from "@/lib/store"
import { Entry } from "@/types/supabase"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "../ui/button"
import { DialogTrigger } from "../ui/dialog"
import { Skeleton } from "../ui/skeleton"
import EntryListItem from "./EntryListItem"

interface EntryListProps {
	data?: Entry[]
	showButtons?: boolean
	onEditItem?: (data: Entry) => void
}

export default function EntryList({
	showButtons = true,
	...props
}: EntryListProps) {
	const queryClient = useQueryClient()
	const setData = useGlobalStore((state) => state.setData)
	const setOnSubmitSuccess = useGlobalStore((state) => state.setOnSubmitSuccess)

	const renderData = () => {
		if (props.data === undefined) {
			return undefined
		}

		if (props.data.length < 1) {
			return (
				<div className="px-0 py-12 grid gap-2 items-center justify-center">
					<p className="text-center">
						No entry data available for this period.
					</p>
					<DialogTrigger asChild>
						<Button
							className="w-fit justify-self-center"
							onClick={() => {
								setData(undefined)
								setOnSubmitSuccess(() => {
									queryClient.invalidateQueries({ queryKey: ENTRY_QKEY })
								})
							}}
						>
							Add an entry
						</Button>
					</DialogTrigger>
				</div>
			)
		}

		return (
			<div className="grid gap-4">
				{props.data.map((val) => (
					<EntryListItem
						showButtons={showButtons}
						key={val.id}
						data={val}
						onEdit={props.onEditItem}
					/>
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

	return <div>{renderData()}</div>
}
