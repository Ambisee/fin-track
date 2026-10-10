"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import ConditionalWrapper from "@/components/user/ConditionalWrapper"
import EntryList from "@/components/user/EntryList"
import EntrySearchBar from "@/components/user/EntrySearchBar"
import TimeFilterControlPanel, {
	changePeriod,
	EntryViewOptions,
	getDefaultEntryViewOptions
} from "@/components/user/TimeFilterControlPanel"
import { DateHelper } from "@/lib/helper/DateHelper"
import { useDashboardTransactionEntries } from "@/lib/hooks"
import {
	useCategoriesQuery,
	useSettingsQuery,
	useUserQuery
} from "@/lib/queries"
import {
	isNonNullable,
	getDateRangeFromViewOptions,
	getCurrencySymbol
} from "@/lib/utils"
import { Entry } from "@/types/supabase"
import { ReloadIcon } from "@radix-ui/react-icons"
import {
	ChevronLeft,
	ChevronRight,
	FileSearchIcon,
	SearchIcon
} from "lucide-react"
import dynamic from "next/dynamic"
import { ReactNode, useState } from "react"
import { DashboardPageLayout } from "../_components/DashboardPageLayout"
import TransactionReportDocument from "@/components/user/TransactionReport/TransactionReportDocument"

const TransactionReportViewer = dynamic(
	() => import("@/components/user/TransactionReport/TransactionReportViewer"),
	{ ssr: false }
)

function EntryContainer(props: {
	isLoading?: boolean
	searchResult?: Entry[] | null
	loadingNode?: ReactNode
	searchResultNode: ReactNode
	entriesNode: ReactNode
}) {
	if (props.isLoading) {
		return props.loadingNode
	}

	if (props.searchResult) {
		return props.searchResultNode
	}

	return props.entriesNode
}

export default function DashboardEntries() {
	const [isReportViewerOpen, setIsReportViewerOpen] = useState(false)
	const [isSearching, setIsSearching] = useState(false)
	const [entryViewOptions, setEntryViewOptions] = useState<EntryViewOptions>(
		() => {
			const initial = getDefaultEntryViewOptions()
			initial.period.timeRange = DateHelper.getMonthStartEnd(new Date())
			return initial
		}
	)
	const [searchResult, setSearchResult] = useState<Entry[] | null>(null)

	const userQuery = useUserQuery()
	const settingsQuery = useSettingsQuery()
	const categoriesQuery = useCategoriesQuery()

	const today = new Date()
	const userName = userQuery.data?.user_metadata["username"]
	const ledgerName = settingsQuery.data?.ledger.name

	const currencyName = settingsQuery.data?.ledger?.currency?.currency_name
	const currency = isNonNullable(currencyName)
		? `${currencyName} (${getCurrencySymbol(currencyName)})`
		: "-"

	const currentLedgerId = settingsQuery.data?.current_ledger
	const dateRange = getDateRangeFromViewOptions(today, entryViewOptions)

	const entryQuery = useDashboardTransactionEntries(
		currentLedgerId,
		entryViewOptions
	)
	const showButton = ["WEEKLY", "MONTHLY", "YEARLY"].includes(
		entryViewOptions.period.type
	)

	return (
		<DashboardPageLayout title="Entries">
			<div className="sticky flex justify-between items-center gap-2 top-0 py-4 z-50 bg-background">
				<SearchIcon className="absolute top-1/2 translate-y-[-50%] left-5 translate-x-[-50%] w-4 h-4 stroke-muted-foreground pointer-events-none" />
				<EntrySearchBar
					disabled={entryQuery.isLoading || !entryQuery.data}
					type="search"
					className="w-full pl-10"
					placeholder="Search for an entry..."
					onSearchStateChange={(state) => setIsSearching(state)}
					onSearchResult={(searchResult) => setSearchResult(searchResult)}
				/>
				<Dialog open={isReportViewerOpen} onOpenChange={setIsReportViewerOpen}>
					<DialogTrigger asChild>
						<Button
							disabled={
								entryQuery.isFetching ||
								entryQuery.isLoading ||
								entryQuery.isFetching ||
								settingsQuery.isLoading ||
								userQuery.isLoading
							}
							variant="ghost"
							size="lg"
							className="px-[initial] aspect-square"
						>
							<FileSearchIcon />
						</Button>
					</DialogTrigger>
					{isReportViewerOpen && (
						<TransactionReportViewer>
							<TransactionReportDocument
								info={{
									username: userName ?? "",
									ledger: ledgerName ?? "",
									period: dateRange,
									locale: navigator.language,
									currency: currency ?? ""
								}}
								entries={
									entryQuery.data?.map((v) => ({
										amount: v.amount,
										category: v.category,
										date: v.date,
										isPositive: v.is_positive
									})) ?? []
								}
								title="FinTrack Report"
								generatedAt={new Date()}
							/>
						</TransactionReportViewer>
					)}
				</Dialog>
			</div>
			<EntryContainer
				isLoading={isSearching}
				searchResult={searchResult}
				loadingNode={
					<div className="grid py-16 justify-center items-center">
						<ReloadIcon className="w-4 h-4 animate-spin" />
					</div>
				}
				searchResultNode={
					<div className="pt-2 pb-4">
						<EntryList
							data={searchResult ?? []}
							virtualizerType={EntryList.VirtualizerType.WINDOW_VIRTUALIZER}
						/>
					</div>
				}
				entriesNode={
					<div>
						<div className="flex justify-center items-center pb-4 pt-2 bg-background">
							<ConditionalWrapper showContent={showButton} fallback={null}>
								<Button
									variant="ghost"
									className="aspect-square"
									onClick={() => {
										const type = entryViewOptions.period.type
										const currentDate = entryViewOptions.period.timeRange?.from
										if (
											!(type in changePeriod) ||
											!isNonNullable(currentDate)
										) {
											return
										}
										setEntryViewOptions((cur) => ({
											...cur,
											period: {
												...cur.period,
												timeRange: changePeriod[type]?.(currentDate, -1)
											}
										}))
									}}
								>
									<ChevronLeft />
								</Button>
							</ConditionalWrapper>
							<Dialog>
								<div className="w-full flex justify-center">
									<TimeFilterControlPanel
										settings={entryViewOptions}
										setSettings={setEntryViewOptions}
										availableCategories={categoriesQuery.data?.map((value) => ({
											name: value.name,
											count: -1
										}))}
									/>
								</div>
							</Dialog>
							<ConditionalWrapper showContent={showButton} fallback={null}>
								<Button
									variant="ghost"
									className="aspect-square"
									onClick={() => {
										const type = entryViewOptions.period.type
										const currentDate = entryViewOptions.period.timeRange?.from
										if (!(type in changePeriod) || !isNonNullable(currentDate))
											return
										setEntryViewOptions((cur) => ({
											...cur,
											period: {
												...cur.period,
												timeRange: changePeriod[type]?.(currentDate, 1)
											}
										}))
									}}
								>
									<ChevronRight />
								</Button>
							</ConditionalWrapper>
						</div>
						{entryQuery.isLoading || entryQuery.data === undefined ? (
							<>
								<Skeleton className="w-full h-25 mb-4" />
								<Skeleton className="w-full h-25 mb-4" />{" "}
							</>
						) : (
							<EntryList
								data={entryQuery.data}
								virtualizerType={EntryList.VirtualizerType.WINDOW_VIRTUALIZER}
							/>
						)}
					</div>
				}
			/>
		</DashboardPageLayout>
	)
}
