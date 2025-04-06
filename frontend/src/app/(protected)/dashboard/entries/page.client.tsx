"use client"

import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import EntryList from "@/components/user/EntryList"
import MonthPicker from "@/components/user/MonthPicker"
import {
	useEntryDataQuery,
	useInfiniteEntryDataQuery,
	useSettingsQuery
} from "@/lib/hooks"
import { ReloadIcon } from "@radix-ui/react-icons"
import { SearchIcon } from "lucide-react"
import { useState } from "react"

export default function DashboardEntries() {
	const [curPeriod, setCurPeriod] = useState<Date>(new Date())
	const [searchQuery, setSearchQuery] = useState<string>("")

	const settingsQuery = useSettingsQuery()
	const entryQuery = useInfiniteEntryDataQuery(
		settingsQuery.data?.data?.current_ledger,
		curPeriod,
		5
	)

	// TODO: Update the search function
	const renderSearchResult = () => {
		return []
	}

	const renderEntries = () => {
		return (
			<div>
				<div className="flex justify-between items-center pb-4 pt-2 bg-background">
					<MonthPicker
						key={`${curPeriod.getMonth()}-${curPeriod.getFullYear()}`}
						value={curPeriod}
						onValueChange={(value) => {
							// TODO: Cancel the currently running query if is ongoing
							if (entryQuery.isFetching) {
							}

							setCurPeriod(value)
						}}
					/>
				</div>
				{entryQuery.isLoading || entryQuery.data === undefined ? (
					<>
						<Skeleton className="w-full h-[6.25rem] mb-4" />
						<Skeleton className="w-full h-[6.25rem] mb-4" />{" "}
					</>
				) : (
					<EntryList
						data={entryQuery.data.pages.map((value) => value.data ?? []).flat()}
						onScrollToBottom={() => {
							if (entryQuery.hasNextPage) entryQuery.fetchNextPage()
						}}
						virtualizerType={EntryList.VirtualizerType.WINDOW_VIRTUALIZER}
					/>
				)}
				{entryQuery.isFetchingNextPage && (
					<div className="w-full flex justify-center items-center py-12">
						<ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
					</div>
				)}
			</div>
		)
	}

	return (
		<div>
			<div className="w-full mb-4 flex justify-between items-center">
				<h1 className="text-3xl">Entries</h1>
			</div>
			<div className="sticky top-0 py-4 z-50 bg-background">
				<SearchIcon className="absolute top-1/2 translate-y-[-50%] left-5 translate-x-[-50%] w-4 h-4 stroke-muted-foreground pointer-events-none" />
				<Input
					disabled={entryQuery.isLoading || !entryQuery.data?.pages}
					type="search"
					className="pl-10"
					placeholder="Search for an entry..."
					value={searchQuery}
					onChange={(e) => {
						setSearchQuery(e.target.value)
					}}
				/>
			</div>
			{searchQuery !== "" ? renderSearchResult() : renderEntries()}
		</div>
	)
}
