"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { MONTHS } from "@/lib/constants"
import {
	useCategoriesQuery,
	useMonthGroupQuery,
	useSettingsQuery,
	useUserQuery
} from "@/lib/queries"
import { Ledger, MonthGroup } from "@/types/supabase"
import { ReloadIcon } from "@radix-ui/react-icons"
import { ArrowUpRightIcon, FileTextIcon, TriangleAlert } from "lucide-react"
import { Dispatch, SetStateAction, useState } from "react"

import TransactionReportDocument from "@/components/user/TransactionReport/TransactionReportDocument"
import TransactionReportViewer from "@/components/user/TransactionReport/TransactionReportViewer"
import { DateHelper, DateRange } from "@/lib/helper/DateHelper"
import { useDashboardTransactionEntries } from "@/lib/hooks"
import { isNonNullable } from "@/lib/utils"
import SubSectionTitle from "../SubSectionTitle"

interface DocumentPageProps {
	isFetchingReport: boolean
	fetchFn: (monthGroup: MonthGroup) => Promise<Blob>
	curPageState: {
		curPage: number
		setCurPage: Dispatch<SetStateAction<number>>
	}
	ledgerState: {
		ledger: Ledger | undefined
		setLedger: Dispatch<SetStateAction<Ledger | undefined>>
	}
}

function MonthGroupList(props: {
	monthGroups: DateRange[] | undefined
	onGroup: (dateRange: DateRange) => void
}) {
	const { monthGroups } = props

	if (!isNonNullable(monthGroups)) {
		return (
			<div className="h-full w-full flex flex-col gap-4 items-center justify-center">
				<TriangleAlert className="stroke-destructive" />
				<p className="text-destructive">Error retrieving available periods.</p>
			</div>
		)
	}

	if (monthGroups.length < 1) {
		return (
			<div className="h-full w-full flex flex-col gap-4 items-center justify-center">
				<p className="text-muted-foreground">No reports available.</p>
			</div>
		)
	}

	return (
		<ul>
			{monthGroups
				.filter((v) => isNonNullable(v.from) && isNonNullable(v.to))
				.map((v) => {
					return (
						<li key={JSON.stringify(v)}>
							<Button
								variant="ghost"
								className="w-full flex items-center justify-start rounded-none"
								onClick={() => props.onGroup(v)}
							>
								<FileTextIcon />
								<span>
									{MONTHS[v.from!!.getMonth()]} {v.from!!.getFullYear()}
								</span>
								<ArrowUpRightIcon className="w-full ml-auto" />
							</Button>
						</li>
					)
				})}
		</ul>
	)
}

export default function Documents() {
	const [isReportOpen, setIsReportOpen] = useState(false)
	const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

	const userQuery = useUserQuery()
	const settingsQuery = useSettingsQuery()
	const categoriesQuery = useCategoriesQuery()
	const entryQuery = useDashboardTransactionEntries(
		settingsQuery.data?.current_ledger,
		{
			filter: {
				type: "All",
				categories: categoriesQuery.data?.map((v) => v.name) ?? [],
				amountRange: undefined
			},
			period: { timeRange: dateRange, type: "MONTHLY" }
		}
	)
	const monthGroupQuery = useMonthGroupQuery(settingsQuery.data?.current_ledger)

	const isSafeToShowTransactionViewer =
		isNonNullable(dateRange) &&
		!entryQuery.isFetching &&
		!entryQuery.isLoading &&
		!userQuery.isFetching &&
		!userQuery.isLoading

	return (
		<div className="mt-8">
			<div>
				<SubSectionTitle>Documents</SubSectionTitle>
				<p className="text-sm text-muted-foreground">
					View and download a report on your activities for a selected month.
				</p>
			</div>
			<div className="mt-4 relative h-96 rounded-md border overflow-y-auto">
				{userQuery.isLoading ||
				settingsQuery.isLoading ||
				monthGroupQuery.isLoading ||
				monthGroupQuery.isFetching ? (
					<ReloadIcon className="absolute top-1/2 left-1/2 translate-[-50%] mr-2 h-4 w-4 animate-spin" />
				) : (
					<MonthGroupList
						onGroup={(dateRange) => {
							setDateRange(dateRange)
							setIsReportOpen(true)
						}}
						monthGroups={monthGroupQuery.data?.map((v) =>
							DateHelper.getMonthStartEnd(new Date(v.year ?? 0, v.month ?? 0))
						)}
					/>
				)}
			</div>
			<Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
				{isReportOpen && (
					<TransactionReportViewer isLoading={!isSafeToShowTransactionViewer}>
						<TransactionReportDocument
							info={{
								username: userQuery.data?.user_metadata["username"],
								ledger: settingsQuery.data!!.ledger.name,
								locale: navigator.language,
								period: dateRange!!,
								currency: settingsQuery.data!!.ledger.currency.currency_name
							}}
							entries={
								entryQuery.data?.map((v) => ({
									category: v.category,
									date: new Date(v.date),
									amount: v.amount,
									isPositive: v.is_positive
								})) ?? []
							}
						/>
					</TransactionReportViewer>
				)}
			</Dialog>
		</div>
	)
}
