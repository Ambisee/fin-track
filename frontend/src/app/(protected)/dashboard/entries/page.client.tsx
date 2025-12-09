"use client"

import { Skeleton } from "@/components/ui/skeleton"
import EntryList from "@/components/user/EntryList"
import EntrySearchBar from "@/components/user/EntrySearchBar"
import MonthPicker from "@/components/user/MonthPicker"
import { useEntryDataQuery, useSettingsQuery } from "@/lib/hooks"
import { Entry } from "@/types/supabase"
import { ReloadIcon } from "@radix-ui/react-icons"
import { SearchIcon } from "lucide-react"
import { ReactNode, useState } from "react"

function EntryContainer(props: {
	isLoading?: boolean
	searchResult?: Entry[] | null
	loadingNode?: ReactNode
	searchResultNode: ReactNode
	entriesNode: ReactNode
}) {
	if (props.isLoading) {
		return props.loadingNode
	}

	if (props.searchResult) {
		return props.searchResultNode
	}

	return props.entriesNode
}

export default function DashboardEntries() {
	const [isSearching, setIsSearching] = useState(false)
	const [curPeriod, setCurPeriod] = useState<Date>(new Date())
	const [searchResult, setSearchResult] = useState<Entry[] | null>(null)

	const settingsQuery = useSettingsQuery()
	const entryQuery = useEntryDataQuery(
		settingsQuery.data?.current_ledger,
		curPeriod
	)

	return (
		<div>
			<div className="w-full mb-4 flex justify-between items-center">
				<h1 className="text-3xl">Entries</h1>
			</div>
			<div className="sticky top-0 py-4 z-50 bg-background">
				<SearchIcon className="absolute top-1/2 translate-y-[-50%] left-5 translate-x-[-50%] w-4 h-4 stroke-muted-foreground pointer-events-none" />
				<EntrySearchBar
					disabled={entryQuery.isLoading || !entryQuery.data}
					type="search"
					className="pl-10"
					placeholder="Search for an entry..."
					onSearchStateChange={(state) => setIsSearching(state)}
					onSearchResult={(searchResult) => setSearchResult(searchResult)}
				/>
			</div>
			<EntryContainer
				isLoading={isSearching}
				searchResult={searchResult}
				loadingNode={
					<div className="grid py-16 justify-center items-center">
						<ReloadIcon className="w-4 h-4 animate-spin" />
					</div>
				}
				searchResultNode={
					<div className="pt-2 pb-4">
						<EntryList
							data={searchResult ?? []}
							virtualizerType={EntryList.VirtualizerType.WINDOW_VIRTUALIZER}
						/>
					</div>
				}
				entriesNode={
					<div>
						<div className="flex justify-between items-center pb-4 pt-2 bg-background">
							<MonthPicker
								key={`${curPeriod.getMonth()}-${curPeriod.getFullYear()}`}
								value={curPeriod}
								onValueChange={(value) => {
									setCurPeriod(value)
								}}
							/>
						</div>
						{entryQuery.isLoading || entryQuery.data === undefined ? (
							<>
								<Skeleton className="w-full h-25 mb-4" />
								<Skeleton className="w-full h-25 mb-4" />{" "}
							</>
						) : (
							<EntryList
								data={entryQuery.data}
								virtualizerType={EntryList.VirtualizerType.WINDOW_VIRTUALIZER}
							/>
						)}
					</div>
				}
			/>
		</div>
	)
}
