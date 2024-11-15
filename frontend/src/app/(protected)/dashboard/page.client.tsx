"use client"

import { Skeleton } from "@/components/ui/skeleton"
import EntryList from "@/components/user/EntryList"
import { useEntryDataQuery, useSettingsQuery, useUserQuery } from "@/lib/hooks"
import { filterDataGroup } from "@/lib/utils"
import { useContext } from "react"
import { DashboardContext } from "./layout"
import { DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function DashboardHome() {
	const { dataGroups } = useContext(DashboardContext)

	const userQuery = useUserQuery()
	const entryDataQuery = useEntryDataQuery()
	const userSettingsQuery = useSettingsQuery()

	const renderWelcomeMessage = () => {
		if (userQuery.isLoading || userQuery.data?.data?.user === undefined) {
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
						<span className="text-sm mr-4 bg-secondary text-secondary-foreground rounded-full py-0.5 px-6">
							{userSettingsQuery.data?.data?.ledger?.name}
						</span>
					</div>
					<h3 className="text-2xl mt-4">
						Welcome back, {userQuery.data?.data?.user.user_metadata.username}
					</h3>
				</div>
			)
		} else {
			return (
				<div className="mb-8">
					<h1 className="text-2xl">Home</h1>
					<h3 className="text-lg">ERROR</h3>
				</div>
			)
		}
	}

	const renderThisMonthEntries = () => {
		if (entryDataQuery.isLoading || userQuery.isLoading) {
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
				<h2 className="text-xl mb-4">Transactions in November 2024</h2>
				<EntryList data={group} />
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
