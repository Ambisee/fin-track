"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import EntryList from "@/components/user/EntryList"
import { useEntryDataQuery } from "@/lib/hooks"
import { sortDataByDateGroup } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useContext, useEffect, useMemo, useState, useTransition } from "react"
import { DashboardContext } from "../layout"
import { SearchResult } from "minisearch"
import { MONTHS } from "@/lib/constants"

export default function DashboardEntries() {
	const [curIndex, setCurIndex] = useState(-1)
	const [searchQuery, setSearchQuery] = useState<string>("")
	const [searchResult, setSearchResult] = useState<SearchResult[] | null>(null)
	const [isPending, startTransition] = useTransition()
	const { search } = useContext(DashboardContext)

	const entryQuery = useEntryDataQuery()

	const dataGroups = useMemo(() => {
		if (entryQuery.isLoading) {
			return []
		}

		if (entryQuery.data === undefined || entryQuery.data.data === null) {
			return []
		}

		const result = sortDataByDateGroup(entryQuery.data.data)
		if (result.length < 1) {
			const d = new Date()
			return [
				{
					month: MONTHS[d.getMonth()],
					year: d.getFullYear(),
					data: []
				}
			]
		}

		return result
	}, [entryQuery.data, entryQuery.isLoading])

	const renderSearchResult = () => {
		if (
			entryQuery.isLoading ||
			!entryQuery.data?.data ||
			searchResult === null
		) {
			return []
		}

		const data = []
		for (const value of searchResult) {
			data.push(entryQuery.data.data[value.id])
		}

		return (
			<div className="mt-14">
				<EntryList data={data} />
			</div>
		)
	}

	const renderEntries = () => {
		if (curIndex === -1 || entryQuery.isLoading || !entryQuery.data?.data) {
			return (
				<>
					<div className="mb-8">
						<div className="w-full flex justify-between items-center mb-4 pb-4">
							<Skeleton className="w-14 h-14" />
							<Skeleton className="w-36 h-14" />
							<Skeleton className="w-14 h-14" />
						</div>
						<Skeleton className="w-full h-[6.25rem] mb-4" />
						<Skeleton className="w-full h-[6.25rem] mb-4" />
					</div>
				</>
			)
		}

		const currentGroup = dataGroups[curIndex]
		if (!currentGroup) {
			return
		}

		return (
			<div className="mb-8">
				<div className="flex justify-between items-center pb-4 bg-background">
					<Button
						className="w-fit h-fit p-0 hover:bg-background"
						variant="ghost"
						disabled={curIndex === dataGroups.length - 1}
						onClick={() =>
							setCurIndex((c) => Math.min(dataGroups.length - 1, c + 1))
						}
					>
						<ChevronLeft className="w-4 h-4" />
					</Button>
					<Button variant="ghost" className="text-lg" asChild>
						<h3 className="text-lg hover:cursor-pointer">
							{dataGroups?.[curIndex]?.month} {dataGroups?.[curIndex]?.year}
						</h3>
					</Button>
					<Button
						className="w-fit h-fit p-0 hover:bg-background"
						variant="ghost"
						disabled={curIndex === 0}
						onClick={() => setCurIndex((c) => Math.max(0, c - 1))}
					>
						<ChevronRight className="w-4 h-4" />
					</Button>
				</div>
				{!currentGroup ? (
					<div>No entries available for this period.</div>
				) : (
					<EntryList data={currentGroup.data} />
				)}
			</div>
		)
	}

	useEffect(() => {
		if (curIndex !== -1) return

		// Use binary search to lookup the current month's DataGroup
		const today = new Date()

		let l = 0
		let r = dataGroups.length - 1
		let mid = l + Math.floor((r - l) / 2)

		while (l < r) {
			mid = l + Math.floor((r - l) / 2)
			const cur = new Date(
				dataGroups[mid].year,
				MONTHS.indexOf(dataGroups[mid].month)
			)

			if (
				cur.getMonth() === today.getMonth() &&
				cur.getFullYear() === today.getFullYear()
			) {
				setCurIndex(Math.min(mid, dataGroups.length - 1))
				return
			}

			if (cur < today) {
				l = mid + 1
			} else {
				r = mid - 1
			}
		}

		setCurIndex(Math.min(l, dataGroups.length - 1))
	}, [curIndex, dataGroups])

	return (
		<>
			<h1 className="text-2xl">Entries</h1>
			<div className="sticky top-0 py-4 bg-background">
				<Input
					placeholder="Search for an entry..."
					value={searchQuery}
					onChange={(e) => {
						setSearchQuery(e.target.value)
						if (e.target.value === "") {
							setSearchResult(null)
							return
						}

						startTransition(() => {
							setSearchResult(search.search(e.target.value, { prefix: true }))
						})
					}}
				/>
			</div>
			{searchQuery !== "" ? renderSearchResult() : renderEntries()}
		</>
	)
}
