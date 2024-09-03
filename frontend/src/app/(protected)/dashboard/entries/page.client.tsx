"use client"

import { Skeleton } from "@/components/ui/skeleton"
import EntryList from "@/components/user/EntryList"
import { ENTRY_QKEY, USER_QKEY } from "@/lib/constants"
import { sbBrowser } from "@/lib/supabase"
import { sortDataByDateGroup } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

export default function DashboardEntries() {
	const userQuery = useQuery({
		queryKey: USER_QKEY,
		queryFn: () => sbBrowser.auth.getUser(),
		refetchOnWindowFocus: false,
		refetchOnMount: (query) => query.state.data === undefined
	})
	const entriesQuery = useQuery({
		queryKey: ENTRY_QKEY,
		queryFn: async () =>
			sbBrowser
				.from("entry")
				.select("*")
				.eq("created_by", userQuery?.data?.data.user?.id as string)
				.order("date", { ascending: false })
				.limit(100),
		refetchOnWindowFocus: false,
		refetchOnMount: (query) => query.state.data === undefined,
		enabled: !!userQuery.data
	})

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
