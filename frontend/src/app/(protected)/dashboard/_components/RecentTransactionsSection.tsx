import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import ConditionalWrapper from "@/components/user/ConditionalWrapper"
import EntryList from "@/components/user/EntryList"
import { EntryViewOptions } from "@/components/user/TimeFilterControlPanel"
import { DateHelper } from "@/lib/helper/DateHelper"
import { useDashboardTransactionEntries } from "@/lib/hooks"
import { useSettingsQuery } from "@/lib/queries"
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
	const [viewOptions] = useState<EntryViewOptions>(() => {
		const monthSpan = DateHelper.getMonthStartEnd(today)
		return {
			filter: {
				type: "All",
				categories: undefined,
				amountRange: undefined
			},
			period: {
				type: "MONTHLY",
				timeRange: monthSpan
			}
		}
	})

	const settingsQuery = useSettingsQuery()
	const currentLedgerId = settingsQuery.data?.visibleLedger.id

	const entryDataQuery = useDashboardTransactionEntries(
		currentLedgerId,
		viewOptions
	)

	return (
		<div className="mt-4 pt-4">
			<h4 className="mb-4">Recent Transactions</h4>
			<ConditionalWrapper
				showContent={
					(!entryDataQuery.isLoading || entryDataQuery.isError) &&
					isNonNullable(entryDataQuery.data)
				}
				fallback={<EntryListSkeleton />}
			>
				<ConditionalWrapper
					showContent={!entryDataQuery.isError}
					fallback={
						<ErrorFetchingDataAlert
							error={entryDataQuery.errors.filter((e) => isNonNullable(e))[0]}
						/>
					}
				>
					<EntryList
						data={entryDataQuery.data ?? []}
						virtualizerType={EntryList.VirtualizerType.WINDOW_VIRTUALIZER}
					/>
				</ConditionalWrapper>
			</ConditionalWrapper>
		</div>
	)
}
