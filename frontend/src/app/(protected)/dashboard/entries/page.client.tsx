"use client"

import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import EntryList from "@/components/user/EntryList"
import { useEntryDataQuery, useUserQuery } from "@/lib/hooks"
import { getPeriodFromIndex, sortDataByDateGroup } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
	Suspense,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	useTransition
} from "react"
import { DashboardContext } from "../layout"
import { SearchResult } from "minisearch"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue
} from "@/components/ui/select"
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
		if (curIndex === -1 || entryQuery.isLoading || !entryQuery.data?.data) {
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

		const currentGroup = dataGroups[curIndex]
		if (!currentGroup) {
			return <div>No entries available for this period.</div>
		}

		const firstPeriod = new Date(
			`01-${dataGroups[0].month}-${dataGroups[0].year}`
		)
		const [month, year] = getPeriodFromIndex(curIndex, firstPeriod)
		return (
			<Dialog>
				<DialogContent onCloseAutoFocus={(e) => e.preventDefault()}>
					<DialogHeader>
						<DialogTitle>Select a period</DialogTitle>
						<DialogDescription>
							<VisuallyHidden>
								Select the month/year period that you wish to view
							</VisuallyHidden>
						</DialogDescription>
					</DialogHeader>
					<div className="flex items-center justify-around gap-4">
						<Select>
							<SelectTrigger>
								<SelectValue placeholder={MONTHS[month]} />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									{MONTHS.map((value, index) => (
										<SelectItem key={value} value={index.toString()}>
											{value}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
						<Select>
							<SelectTrigger>
								<SelectValue placeholder={year} />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									{Array(50)
										.map((_, index) => firstPeriod.getFullYear() - 25 + index)
										.map((value) => (
											<SelectItem key={value} value={value.toString()}>
												{value}
											</SelectItem>
										))}
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
				</DialogContent>
				<div className="mb-8">
					<div className="flex justify-between items-center px-1 py-1 mb-4">
						<Button
							className="h-full aspect-square rounded-full"
							variant="ghost"
							disabled={curIndex === 0}
							onClick={() => setCurIndex((c) => Math.max(0, c - 1))}
						>
							<ChevronLeft className="w-4 h-4" />
						</Button>
						<DialogTrigger asChild>
							<Button variant="ghost" className="text-lg" asChild>
								<h3 className="text-lg hover:cursor-pointer h-full">
									{dataGroups?.[curIndex]?.month} {dataGroups?.[curIndex]?.year}
								</h3>
							</Button>
						</DialogTrigger>
						<Button
							className="h-full aspect-square rounded-full"
							variant="ghost"
							disabled={curIndex === dataGroups.length - 1}
							onClick={() =>
								setCurIndex((c) => Math.min(dataGroups.length - 1, c + 1))
							}
						>
							<ChevronRight className="w-4 h-4" />
						</Button>
					</div>
					<EntryList data={dataGroups[curIndex].data} />
				</div>
			</Dialog>
		)
	}

	useEffect(() => {
		if (dataGroups.length > 0 && curIndex === -1) {
			const today = new Date()
			const firstPeriod = new Date(
				`01-${dataGroups[0].month}-${dataGroups[0].year}`
			)
			const idx =
				12 * (today.getFullYear() - firstPeriod.getFullYear()) +
				(today.getMonth() - firstPeriod.getMonth())

			setCurIndex(Math.min(idx, dataGroups.length - 1))
		}
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
