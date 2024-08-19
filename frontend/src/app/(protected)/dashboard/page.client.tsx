"use client"

import { useEffect, useState } from "react"

import { User } from "@supabase/supabase-js"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { sbBrowser } from "@/lib/supabase"
import { useGlobalStore } from "@/lib/store"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import EntryList from "@/components/user/EntryList"
import { DataTable } from "@/components/ui/data-table"
import { useQuery } from "@tanstack/react-query"
import { Entry } from "@/types/supabase"
import { ENTRY_QKEY, USER_QKEY } from "@/lib/constants"

export default function DashboardHome() {
	const { toast } = useToast()
	const userQuery = useQuery({
		queryKey: USER_QKEY,
		queryFn: () => sbBrowser.auth.getUser(),
		staleTime: 30000,
		refetchOnMount: (query) => {
			return query.state.data === undefined
		}
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
		refetchOnMount: (query) => {
			return query.state.data === undefined
		},
		enabled: !!userQuery.data
	})

	const renderWelcomeMessage = () => {
		if (userQuery.isLoading) {
			return <Skeleton className="w-full h-8 mb-8" />
		} else if (
			userQuery.data?.data?.user !== null &&
			userQuery.data?.data?.user !== undefined
		) {
			return (
				<h1 className="text-2xl mb-8">
					Welcome back, {userQuery.data?.data?.user.user_metadata.username}
				</h1>
			)
		} else {
			return <h1 className="text-2xl mb-8">ERROR</h1>
		}
	}

	const renderRecentEntries = () => {
		if (entriesQuery.isLoading) {
			return <Skeleton className="w-full" />
		}

		return (
			<div className="mb-4">
				<h2 className="text-xl mb-4">Recent Entries</h2>
				<EntryList data={entriesQuery.data?.data ?? undefined} />
			</div>
		)
	}

	return (
		<div>
			{renderWelcomeMessage()}
			{renderRecentEntries()}
		</div>
	)
}
