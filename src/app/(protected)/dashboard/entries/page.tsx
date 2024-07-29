"use client"

import { Skeleton } from "@/components/ui/skeleton"
import EntryList from "@/components/user/EntryList"
import { sbBrowser } from "@/lib/supabase"
import { sortDataByDateGroup } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

export default function EntriesPage() {
	const { data: userData } = useQuery({
		queryKey: ["user"],
		queryFn: () => sbBrowser.auth.getUser(),
		refetchOnMount: false
	})
	const entryData = useQuery({
		queryKey: ["entryData"],
		queryFn: async () =>
			sbBrowser
				.from("entry")
				.select("*")
				.eq("created_by", userData?.data.user?.id as string)
				.order("date", { ascending: false })
				.limit(100),
		refetchOnMount: false,
		enabled: !!userData
	})

	const dataGroups = useMemo(() => {
		if (entryData.data === undefined || entryData.data.data === null) {
			return undefined
		}

		return sortDataByDateGroup(entryData.data.data)
	}, [entryData.data])

	if (entryData.isLoading || dataGroups === undefined) {
		return (
			<>
				<h2 className="text-xl mb-4">Entries</h2>
				<Skeleton className="w-full h-10" />
			</>
		)
	}

	return (
		<>
			<h2 className="text-xl mb-4">Entries</h2>
			{dataGroups.map((value) => {
				return (
					<div key={value.month + value.year} className="my-8">
						<h3 className="text-lg mb-4">
							{value.month} {value.year}
						</h3>
						<EntryList data={value.data} />
					</div>
				)
			})}
		</>
	)
}
