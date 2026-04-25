import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import ConditionalWrapper from "@/components/user/ConditionalWrapper"
import EntryList from "@/components/user/EntryList"
import { MONTHS } from "@/lib/constants"
import { DateHelper } from "@/lib/helper/DateHelper"
import { useEntryDataQuery, useSettingsQuery } from "@/lib/queries"
import { isNonNullable } from "@/lib/utils"
import { PostgrestError } from "@supabase/supabase-js"
import { useState } from "react"

function EntryListSkeleton(props: { count?: number }) {
	const { count = 10 } = props

	const skeletons = []
	for (let i = 0; i < count; i++) {
		skeletons.push(<Skeleton key={i} className="w-full h-25" />)
	}

	return <div className="grid gap-4">{skeletons}</div>
}

function ErrorFetchingDataAlert(props: { error: Error | null }) {
	const description = (error: Error | null) => {
		if (!isNonNullable(error)) {
			return "Something went wrong..."
		}

		if (error instanceof PostgrestError) {
			return `Error code: ${error.code}`
		}

		return error.message
	}

	return (
		<Alert variant="destructive">
			<AlertTitle>Unable to retrieve entry data.</AlertTitle>
			<AlertDescription>{description(props.error)}</AlertDescription>
		</Alert>
	)
}

export default function RecentTransactionSection() {
	const [today] = useState(new Date())

	const settingsQuery = useSettingsQuery()

	const currentLedgerId = settingsQuery.data?.current_ledger
	const dateRange = DateHelper.getMonthStartEnd(today)

	const entryDataQuery = useEntryDataQuery(currentLedgerId, dateRange)

	return (
		<div className="mt-4 pt-4">
			<h4 className="mb-4">
				Transactions in {MONTHS[today.getMonth()]} {today.getFullYear()}
			</h4>
			<ConditionalWrapper
				showContent={!entryDataQuery.isLoading && entryDataQuery.isFetched}
				fallback={<EntryListSkeleton />}
			>
				<ConditionalWrapper
					showContent={!entryDataQuery.isLoadingError}
					fallback={<ErrorFetchingDataAlert error={entryDataQuery.error} />}
				>
					<EntryList
						data={entryDataQuery.data ?? []}
						virtualizerType={EntryList.VirtualizerType.WINDOW_VIRTUALIZER}
					/>
				</ConditionalWrapper>
			</ConditionalWrapper>
		</div>
	)

	// if (entryDataQuery.isLoading || !entryDataQuery.isFetched) {
	// 	return (
	// 		<div className="mt-4 pt-4">
	// 			<Skeleton className="w-56 h-7 mb-4" />
	// 			<div className="grid gap-4">
	// 				<Skeleton className="w-full h-25" />
	// 				<Skeleton className="w-full h-25" />
	// 				<Skeleton className="w-full h-25" />
	// 			</div>
	// 		</div>
	// 	)
	// }

	// if (!isNonNullable(entryDataQuery.data)) {
	// 	return (
	// 		<Alert variant="destructive" className="">
	// 			<AlertTitle>Unable to retrieve entry data</AlertTitle>
	// 			<AlertDescription>
	// 				{entryDataQuery.failureReason?.message}
	// 			</AlertDescription>
	// 		</Alert>
	// 	)
	// }

	// return (
	// 	<div className="pt-4 mt-4">
	// 		<h4 className="mb-4">
	// 			Transactions in {MONTHS[today.getMonth()]} {today.getFullYear()}
	// 		</h4>
	// 		<EntryList
	// 			data={entryDataQuery.data}
	// 			virtualizerType={EntryList.VirtualizerType.WINDOW_VIRTUALIZER}
	// 		/>
	// 	</div>
	// )
}
