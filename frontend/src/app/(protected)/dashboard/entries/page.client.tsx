"use client"

import { Skeleton } from "@/components/ui/skeleton"
import EntryList from "@/components/user/EntryList"
import { useEntryDataQuery, useUserQuery } from "@/lib/hooks"
import { sortDataByDateGroup } from "@/lib/utils"
import { useMemo } from "react"

export default function DashboardEntries() {
	const userQuery = useUserQuery()
	const entriesQuery = useEntryDataQuery()

	const dataGroups = useMemo(() => {
		if (entriesQuery.isLoading) {
			return []
		}

		if (entriesQuery.data === undefined || entriesQuery.data.data === null) {
			return []
		}

		return sortDataByDateGroup(entriesQuery.data.data)
	}, [entriesQuery.data, entriesQuery.isLoading])

	const renderEntries = () => {
		if (entriesQuery.isLoading) {
			return (
				<>
					<div className="mb-8">
						<Skeleton className="w-32 h-8 mb-4" />
						<Skeleton className="w-full h-[6.25rem] mb-4" />
						<Skeleton className="w-full h-[6.25rem] mb-4" />
					</div>
					<div>
						<Skeleton className="w-32 h-8 mb-4" />
						<Skeleton className="w-full h-[6.25rem] mb-4" />
						<Skeleton className="w-full h-[6.25rem] mb-4" />
					</div>
					<div className="mb-8">
						<Skeleton className="w-32 h-8 mb-4" />
						<Skeleton className="w-full h-[6.25rem] mb-4" />
						<Skeleton className="w-full h-[6.25rem] mb-4" />
					</div>
				</>
			)
		}

		return dataGroups.map((value) => {
			return (
				<div key={value.month + value.year} className="my-8">
					<h3 className="text-lg mb-4">
						{value.month} {value.year}
					</h3>
					<EntryList data={value.data} />
				</div>
			)
		})
	}

	return (
		<>
			<h1 className="text-2xl mb-8">Entries</h1>
			{renderEntries()}
		</>
	)
}
