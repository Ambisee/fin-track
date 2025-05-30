"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import EntryList from "@/components/user/EntryList"
import { MONTHS } from "@/lib/constants"
import { useEntryDataQuery, useSettingsQuery, useUserQuery } from "@/lib/hooks"
import { isNonNullable } from "@/lib/utils"

export default function DashboardHome() {
	const today = new Date()

	const userQuery = useUserQuery()
	const settingsQuery = useSettingsQuery()
	const entryDataQuery = useEntryDataQuery(
		settingsQuery.data?.current_ledger,
		today
	)

	const renderWelcomeMessage = () => {
		if (
			userQuery.isLoading ||
			!userQuery.isFetched ||
			userQuery.data === undefined
		) {
			return (
				<div className="mb-8">
					<Skeleton className="w-24 h-9" />
					<Skeleton className="min-w-36 w-3/4 h-8 mt-4" />
				</div>
			)
		} else if (userQuery.data !== null) {
			return (
				<div className="mb-8">
					<div className="w-full mb-4 flex justify-between items-center">
						<h1 className="text-3xl">Home</h1>
					</div>
					<h2 className="text-2xl mt-4">
						Welcome back, {userQuery.data.user_metadata.username}
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
		if (entryDataQuery.isLoading || !entryDataQuery.isFetched) {
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

		if (!isNonNullable(entryDataQuery.data)) {
			return (
				<Alert variant="destructive">
					<AlertTitle>Unable to retrieve entry data</AlertTitle>
					<AlertDescription>
						{entryDataQuery.failureReason?.message}
					</AlertDescription>
				</Alert>
			)
		}

		return (
			<div>
				<h2 className="text-xl mb-4">
					Transactions in {MONTHS[today.getMonth()]} {today.getFullYear()}
				</h2>
				<EntryList
					data={entryDataQuery.data}
					virtualizerType={EntryList.VirtualizerType.WINDOW_VIRTUALIZER}
				/>
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
