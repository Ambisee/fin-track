"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import EntryList from "@/components/user/EntryList"
import { useEntryDataQuery } from "@/lib/hooks"
import { getDataGroup, sortDataByDateGroup } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useContext, useEffect, useMemo, useState, useTransition } from "react"
import { DashboardContext } from "../layout"
import { SearchResult } from "minisearch"
import { MONTHS } from "@/lib/constants"

export default function DashboardEntries() {
	const [curPeriod, setCurPeriod] = useState<number[] | undefined>(undefined)
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
		if (
			curPeriod === undefined ||
			entryQuery.isLoading ||
			!entryQuery.data?.data
		) {
			return (
				<div className="mb-8">
					<div className="w-full flex justify-between items-center mb-4 pb-4">
						<Skeleton className="w-14 h-14" />
						<Skeleton className="w-36 h-14" />
						<Skeleton className="w-14 h-14" />
					</div>
					<Skeleton className="w-full h-[6.25rem] mb-4" />
					<Skeleton className="w-full h-[6.25rem] mb-4" />
				</div>
			)
		}

		const currentGroup = getDataGroup(curPeriod[0], curPeriod[1], dataGroups)

		return (
			<div className="mb-8">
				<div className="flex justify-between items-center pb-4 bg-background">
					<Button
						className="w-12 h-12 rounded-full"
						variant="ghost"
						onClick={() =>
							setCurPeriod((c) => {
								if (c === undefined) return

								const result = [c[0] - 1, c[1]]
								if (result[0] < 0) {
									result[0] = 11
									result[1] -= 1
								}

								return result
							})
						}
					>
						<ChevronLeft className="w-4 h-4" />
					</Button>
					<Button variant="ghost" className="text-lg" asChild>
						<h3 className="text-lg hover:cursor-pointer">
							{currentGroup.month} {currentGroup.year}
						</h3>
					</Button>
					<Button
						className="h-12 w-12 rounded-full"
						variant="ghost"
						onClick={() =>
							setCurPeriod((c) => {
								if (c === undefined) return

								const result = [c[0] + 1, c[1]]
								result[1] += Math.floor(result[0] / 12)
								result[0] = result[0] % 12

								return result
							})
						}
					>
						<ChevronRight className="w-4 h-4" />
					</Button>
				</div>
				{currentGroup.data.length === 0 ? (
					<div>No entries available for this period.</div>
				) : (
					<EntryList data={currentGroup.data} />
				)}
			</div>
		)
	}

	useEffect(() => {
		if (curPeriod === undefined) {
			const today = new Date()
			setCurPeriod([today.getMonth(), today.getFullYear()])
		}
	}, [curPeriod])

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
