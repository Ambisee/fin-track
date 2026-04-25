"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import EntryList from "@/components/user/EntryList"
import { MONTHS } from "@/lib/constants"
import { DateHelper } from "@/lib/helper/DateHelper"
import { useEntryDataQuery, useSettingsQuery } from "@/lib/queries"
import { isNonNullable } from "@/lib/utils"
import { DashboardPageLayout } from "./_components/DashboardPageLayout"
import SummarySection from "./_components/SummarySection"

export default function DashboardHome() {
	const today = new Date()

	const settingsQuery = useSettingsQuery()

	const currentLedgerId = settingsQuery.data?.current_ledger
	const dateRange = DateHelper.getMonthStartEnd(today)

	const entryDataQuery = useEntryDataQuery(currentLedgerId, dateRange)

	const renderThisMonthEntries = () => {
		if (entryDataQuery.isLoading || !entryDataQuery.isFetched) {
			return (
				<div className="mt-4 pt-4">
					<Skeleton className="w-56 h-7 mb-4" />
					<div className="grid gap-4">
						<Skeleton className="w-full h-25" />
						<Skeleton className="w-full h-25" />
						<Skeleton className="w-full h-25" />
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
			<div className="pt-4 mt-4">
				<h4 className="mb-4">
					Transactions in {MONTHS[today.getMonth()]} {today.getFullYear()}
				</h4>
				<EntryList
					data={entryDataQuery.data}
					virtualizerType={EntryList.VirtualizerType.WINDOW_VIRTUALIZER}
				/>
			</div>
		)
	}

	return (
		<DashboardPageLayout title="Home">
			<SummarySection />
			{renderThisMonthEntries()}
		</DashboardPageLayout>
	)
}
