"use client"

import { Skeleton } from "@/components/ui/skeleton"
import EntryList from "@/components/user/EntryList"
import { useEntryDataQuery, useUserQuery } from "@/lib/hooks"
import { filterDataGroup } from "@/lib/utils"
import { useContext } from "react"
import { DashboardContext } from "./layout"
import { MONTHS } from "@/lib/constants"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function DashboardHome() {
	const { dataGroups } = useContext(DashboardContext)

	const userQuery = useUserQuery()
	const entryDataQuery = useEntryDataQuery()

	const renderWelcomeMessage = () => {
		if (
			userQuery.isLoading ||
			!userQuery.isFetched ||
			userQuery.data?.data?.user === undefined
		) {
			return (
				<div className="mb-8">
					<Skeleton className="w-24 h-9" />
					<Skeleton className="min-w-36 w-3/4 h-8 mt-4" />
				</div>
			)
		} else if (userQuery.data?.data?.user !== null) {
			return (
				<div className="mb-8">
					<div className="w-full mb-4 flex justify-between items-center">
						<h1 className="text-3xl">Home</h1>
					</div>
					<h2 className="text-2xl mt-4">
						Welcome back, {userQuery.data?.data?.user.user_metadata.username}
					</h2>
				</div>
			)
		} else {
			return (
				<div className="mb-8">
					<div className="w-full mb-4 flex justify-between items-center">
						<h1 className="text-3xl">Home</h1>
					</div>
					<Alert variant="destructive">
						<AlertTitle>User data not found</AlertTitle>
						<AlertDescription>
							{userQuery.failureReason?.message}
						</AlertDescription>
					</Alert>
				</div>
			)
		}
	}

	const renderThisMonthEntries = () => {
		if (!entryDataQuery.isFetched || entryDataQuery.isFetching) {
			return (
				<div>
					<Skeleton className="w-56 h-6 mb-4" />
					<div className="grid gap-4">
						<Skeleton className="w-full h-[6.25rem]" />
						<Skeleton className="w-full h-[6.25rem]" />
						<Skeleton className="w-full h-[6.25rem]" />
					</div>
				</div>
			)
		}

		const today = new Date()
		const group = filterDataGroup(
			today.getMonth(),
			today.getFullYear(),
			dataGroups
		).data

		return (
			<div>
				<h2 className="text-xl mb-4">
					Transactions in {MONTHS[today.getMonth()]} {today.getFullYear()}
				</h2>
				<EntryList data={group.toReversed()} />
			</div>
		)
	}

	return (
		<div>
			{renderWelcomeMessage()}
			{renderThisMonthEntries()}
		</div>
	)
}
