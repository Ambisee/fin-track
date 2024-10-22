"use client"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import EntryList from "@/components/user/EntryList"
import { useEntryDataQuery, useUserQuery } from "@/lib/hooks"
import { sbBrowser } from "@/lib/supabase"

export default function DashboardHome() {
	const { toast } = useToast()

	const userQuery = useUserQuery()
	const entriesQuery = useEntryDataQuery()

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

	const renderThisMonthEntries = () => {
		const today = new Date()

		return (
			<div>
				<h2 className="text-xl mb-4"></h2>
				<EntryList data={entriesQuery.data?.data?.toReversed() ?? undefined} />
			</div>
		)
	}

	const renderRecentEntries = () => {
		return (
			<div>
				<h2 className="text-xl mb-4">Recent Entries</h2>
				<EntryList data={entriesQuery.data?.data?.toReversed() ?? undefined} />
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
