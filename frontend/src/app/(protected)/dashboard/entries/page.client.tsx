"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import EntryList from "@/components/user/EntryList"
import { useEntryDataQuery, useUserQuery } from "@/lib/hooks"
import { sortDataByDateGroup } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useContext, useEffect, useMemo, useRef, useState } from "react"
import { DashboardContext } from "../layout"
import { SearchResult } from "minisearch"

export default function DashboardEntries() {
	const [curIndex, setCurIndex] = useState(-1)
	const [searchQuery, setSearchQuery] = useState<string>("")
	const [searchResult, setSearchResult] = useState<SearchResult[] | null>(null)
	const { search } = useContext(DashboardContext)

	const userQuery = useUserQuery()
	const entryQuery = useEntryDataQuery()

	const dataGroups = useMemo(() => {
		if (entryQuery.isLoading) {
			return []
		}

		if (entryQuery.data === undefined || entryQuery.data.data === null) {
			return []
		}

		return sortDataByDateGroup(entryQuery.data.data)
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
		let index = curIndex
		let isIndexInitialized = true
		if (index == -1) {
			if (dataGroups.length > 0) {
				const today = new Date()
				const firstPeriod = new Date(
					`${dataGroups[0].month}-${dataGroups[0].year}`
				)
				const index =
					12 * (today.getFullYear() - firstPeriod.getFullYear()) +
					(today.getMonth() - firstPeriod.getMonth())

				setCurIndex(index)
			}

			isIndexInitialized = false
		}

		if (entryQuery.isLoading || !isIndexInitialized) {
			return (
				<>
					<div className="mb-8">
						<div className="w-full flex justify-between items-center mb-4 pb-4">
							<Skeleton className="w-8 h-8" />
							<Skeleton className="w-36 h-8" />
							<Skeleton className="w-8 h-8" />
						</div>
						<Skeleton className="w-full h-[6.25rem] mb-4" />
						<Skeleton className="w-full h-[6.25rem] mb-4" />
					</div>
				</>
			)
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
							{dataGroups[curIndex].month} {dataGroups[curIndex].year}
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
				<EntryList data={dataGroups[curIndex].data} />
			</div>
		)
	}

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

						setSearchResult(search.search(e.target.value, { prefix: true }))
					}}
				/>
			</div>
			{searchQuery !== "" ? renderSearchResult() : renderEntries()}
		</>
	)
}
