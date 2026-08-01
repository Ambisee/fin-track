"use client"

import { Button, buttonVariants } from "@/components/ui/button"
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent
} from "@/components/ui/chart"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ConditionalWrapper from "@/components/user/ConditionalWrapper"
import EntryList from "@/components/user/EntryList"
import TimeFilterControlPanel, {
	changePeriod,
	EntryViewOptions,
	getDefaultEntryViewOptions,
	PERIOD_TYPE
} from "@/components/user/TimeFilterControlPanel"
import { DESKTOP_BREAKPOINT, MONTHS } from "@/lib/constants"
import { DateHelper, DateRange } from "@/lib/helper/DateHelper"
import { QueryHelper } from "@/lib/helper/QueryHelper"
import {
	StatisticGroup,
	Statistics,
	StatisticsHelper
} from "@/lib/helper/StatisticsHelper"
import {
	useAmountFormatter,
	useDashboardTransactionEntries,
	useIsSmallMobile
} from "@/lib/hooks"
import {
	useCategoriesQuery,
	useInvalidateEntryDataQuery,
	useSettingsQuery
} from "@/lib/queries"
import useGlobalStore from "@/lib/store"
import { cn, isNonNullable, truncate } from "@/lib/utils"
import { useQueryClient } from "@tanstack/react-query"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { createContext, useContext, useState } from "react"
import { useMediaQuery } from "react-responsive"
import { Cell, Pie, PieChart } from "recharts"
import { DashboardPageLayout } from "../_components/DashboardPageLayout"

interface StatsUIProps {
	stats: Statistics
	chartConfig: ChartConfig
}

interface CategoryItemProps {
	value: StatisticGroup
	groupColor: string
}

interface ChartDisplayProps {
	data?: StatisticGroup[]
	chartConfig: ChartConfig
	dataKey: string
	nameKey: string
}

const StatisticsPageContext = createContext<{
	viewOptions: EntryViewOptions
}>(null!)

function ChartDisplay(props: ChartDisplayProps) {
	const setData = useGlobalStore((state) => state.setData)
	const setOnSubmitSuccess = useGlobalStore((state) => state.setOnSubmitSuccess)

	const queryClient = useQueryClient()
	const settingsQuery = useSettingsQuery()

	const invalidateEntryQuery = useInvalidateEntryDataQuery()

	const formatAmount = useAmountFormatter()
	const percentageKey = "percentage" as keyof StatisticGroup

	if (props.data === undefined || !settingsQuery.data?.current_ledger) {
		return <Skeleton className="w-full h-62.5 mt-5" />
	}

	if (props.data.length < 1) {
		return (
			<div className="w-full h-62.5 flex items-center justify-center flex-col gap-2">
				<h4>No transaction.</h4>
				<DialogTrigger
					asChild
					onClick={() => {
						setData(undefined)
						setOnSubmitSuccess((data) => {
							const monthStartEnd = DateHelper.getMonthStartEnd(
								new Date(data.date)
							)

							invalidateEntryQuery(data.ledger, monthStartEnd)

							queryClient.invalidateQueries({
								queryKey: QueryHelper.getStatisticQueryKey(
									data.ledger,
									monthStartEnd
								)
							})
						})
					}}
				>
					<Button>Add an entry</Button>
				</DialogTrigger>
			</div>
		)
	}

	return (
		<div>
			<ChartContainer
				config={props.chartConfig}
				className="mx-auto aspect-square w-fit max-w-62.5 min-h-62.5"
			>
				<PieChart>
					<ChartTooltip
						content={
							<ChartTooltipContent
								className="min-w-70 max-w-screen"
								formatterOverride={false}
								formatter={(value, name, item, index, payload: unknown) => {
									const data = payload as Pick<StatisticGroup, "percentage">
									const result = formatAmount(value as number)
									if (percentageKey !== "percentage") {
										return result
									}

									const percentage = 100 * data[percentageKey]
									return result + ` (${percentage.toFixed(2)}%)`
								}}
							/>
						}
					/>
					<Pie
						data={props.data}
						isAnimationActive={false}
						nameKey={props.nameKey}
						dataKey={props.dataKey}
						minAngle={15}
					>
						{props.data.map((_, index) => (
							<Cell key={`cell-${index}`} fill={`var(--chart-${index + 1}`} />
						))}
					</Pie>
				</PieChart>
			</ChartContainer>
			<ul className="[&>li:not(:last-child)]:mb-1.5">
				{props.data
					.toSorted((a, b) => b.percentage - a.percentage)
					.map((value: StatisticGroup, index: number) => (
						<CategoryItem
							key={`${value.category}-${value.isPositive}`}
							value={value}
							groupColor={`var(--chart-${index + 1})`}
						/>
					))}
			</ul>
		</div>
	)
}

function CategoryItem(props: CategoryItemProps) {
	const formatAmount = useAmountFormatter()
	const { viewOptions } = useContext(StatisticsPageContext)

	const shouldUseShort = useIsSmallMobile()
	const settingsQuery = useSettingsQuery()
	const entryDataQuery = useDashboardTransactionEntries(
		settingsQuery.data?.current_ledger,
		viewOptions
	)

	let entryPeriodText: string = ""
	const period = viewOptions.period
	switch (period.type) {
		case "TODAY":
			entryPeriodText = PERIOD_TYPE.TODAY.label
			break
		case "YESTERDAY":
			entryPeriodText = PERIOD_TYPE.YESTERDAY.label
			break
		case "LAST_7_DAYS":
			entryPeriodText = PERIOD_TYPE.LAST_7_DAYS.label
			break
		case "WEEKLY":
			let timeRange: DateRange
			if (isNonNullable(period.timeRange)) {
				timeRange = period.timeRange
			} else {
				timeRange = DateHelper.getWeekStartEnd(new Date())
			}

			const from = timeRange.from!
			const to = timeRange.to!
			if (shouldUseShort) {
				entryPeriodText = `${DateHelper.toShortString(from)} - ${DateHelper.toShortString(to)}`
			} else {
				entryPeriodText = `${DateHelper.toFullString(from)} - ${DateHelper.toFullString(to)}`
			}
			break
		case "MONTHLY":
			const monthDate = new Date(period.timeRange?.from ?? 0)
			entryPeriodText = `${MONTHS[monthDate.getMonth()]} ${monthDate.getFullYear()}`
			break
		case "YEARLY":
			const yearDate = new Date(period.timeRange?.from ?? 0)
			entryPeriodText = `${yearDate.getFullYear()}`
			break
	}

	return (
		<li key={props.value.category}>
			<Dialog>
				<DialogTrigger asChild>
					<button
						className={cn(
							buttonVariants({ variant: "ghost" }),
							"w-full min-w-0 h-auto relative flex items-center gap-2.5 text-md"
						)}
					>
						<div
							style={{ background: props.groupColor }}
							className={`min-w-6 max-w-6 aspect-square rounded-sm`}
						/>
						<div className="max-w-1/2">
							<h5 className="truncate text-sm xs:text-base">
								{props.value.category}
							</h5>
							<p className="text-xs opacity-55 text-left">
								{((props.value.percentage as number) * 100).toFixed(2)}%
							</p>
						</div>
						<span className="text-sm xs:text-base flex-1 text-right">
							{formatAmount(props.value.totalAmount as number)}
						</span>
					</button>
				</DialogTrigger>
				<DialogContent
					hideCloseButton
					className="grid-rows-[auto_1fr] h-dvh max-w-none duration-0 border-0 sm:border sm:h-5/6 sm:min-h-115 sm:max-w-lg"
				>
					<DialogHeader className="relative min-w-0 space-y-0 sm:text-center">
						<DialogTitle
							className="min-w-0 w-full leading-6 px-6 lg:w-full"
							asChild
						>
							<h2 className="leading-6 whitespace-nowrap min-w-0 truncate">
								{props.value.isPositive ? "Income" : "Expense"} -{" "}
								{props.value.category}{" "}
							</h2>
						</DialogTitle>
						<DialogClose className="absolute block right-0 top-3 translate-y-[-50%]">
							<X className="w-4 h-4" />
						</DialogClose>
						<DialogDescription>{entryPeriodText}</DialogDescription>
					</DialogHeader>
					<div className="h-full overflow-y-auto pr-1">
						<EntryList
							data={
								entryDataQuery.data?.filter(
									(v) =>
										v?.category === props.value.category &&
										v?.is_positive == props.value.isPositive
								) ?? []
							}
							showButtons={false}
							virtualizerType={EntryList.VirtualizerType.NORMAL_VIRTUALIZER}
						/>
					</div>
				</DialogContent>
			</Dialog>
		</li>
	)
}

function MobileSkeletonUI() {
	return (
		<div className="[&>.category-item:not(:last-child)]:mb-1.5">
			<Skeleton className="transaction-type w-full h-16.25" />
			<Skeleton className="chart mx-auto my-7.25 rounded-full w-48 aspect-square" />
			<Skeleton className="category-item w-full h-14" />
			<Skeleton className="category-item w-full h-14" />
			<Skeleton className="category-item w-full h-14" />
			<Skeleton className="category-item w-full h-14" />
		</div>
	)
}

function MobileStatsUI(props: StatsUIProps) {
	const [curTab, setCurTab] = useState<string>("expense")

	const formatAmount = useAmountFormatter()

	return (
		<Tabs value={curTab} onValueChange={setCurTab}>
			<TabsList className="w-full h-full relative mb-4 bg-background border rounded-sm">
				<TabsTrigger
					value="expense"
					className="w-1/2 text-left z-50 data-[state=active]:bg-transparent peer/expense group"
					data-is-positive="false"
					data-curtab={curTab}
				>
					<div className="w-full bg-transparent">
						<h4 className="group-data-[curtab='income']:opacity-55 text-base xs:text-lg">
							Total expense
						</h4>
						<h3 className="text-sm xs:text-xl text-entry-item group-data-[curtab='income']:text-opacity-55">
							{formatAmount(props.stats?.totalExpense)}
						</h3>
					</div>
				</TabsTrigger>
				<TabsTrigger
					value="income"
					className="w-1/2 text-left z-50 data-[state=active]:bg-transparent peer/income group"
					data-curtab={curTab}
					data-is-positive="true"
				>
					<div className="w-full bg-transparent">
						<h4 className="group-data-[curtab='expense']:opacity-55 text-base xs:text-lg">
							Total income
						</h4>
						<h3 className="text-sm xs:text-xl text-entry-item group-data-[curtab='expense']:text-opacity-55">
							{formatAmount(props.stats?.totalIncome)}
						</h3>
					</div>
				</TabsTrigger>
				<div
					className="
                        items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 font-medium ring-offset-background transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-muted 
                        absolute top-1 left-1 w-[calc(50%-0.25rem)] h-[calc(100%-0.5rem)] peer-data-[state=active]/income:translate-x-full peer-data-[state=active]/expense:translate-x-0
                        duration-300"
				></div>
			</TabsList>
			<TabsContent value="expense">
				<ChartDisplay
					chartConfig={props.chartConfig}
					data={props.stats.groups
						.filter((value) => !value.isPositive)
						.map((v) => ({ ...v, category: truncate(v.category) }))}
					nameKey="category"
					dataKey="totalAmount"
				/>
			</TabsContent>
			<TabsContent value="income">
				<ChartDisplay
					chartConfig={props.chartConfig}
					data={props.stats.groups
						.filter((value) => value.isPositive)
						.map((v) => ({ ...v, category: truncate(v.category) }))}
					nameKey="category"
					dataKey="totalAmount"
				/>
			</TabsContent>
		</Tabs>
	)
}

function DesktopSkeletonUI() {
	return (
		<div className="flex py-4 w-full min-w-0 max-w-full lg:m-auto rounded-lg border bg-card text-card-foreground shadow-xs">
			<div className="min-w-0 flex-1 px-4 [&>.category-item:not(:last-child)]:mb-1.5">
				<Skeleton className="transaction-type w-37.5 h-8" />
				<Skeleton className="transaction-amount mt-2 w-55 h-9" />
				<Skeleton className="chart mx-auto my-7.25 rounded-full w-48 aspect-square" />
				<Skeleton className="category-item w-full h-14" />
				<Skeleton className="category-item w-full h-14" />
				<Skeleton className="category-item w-full h-14" />
				<Skeleton className="category-item w-full h-14" />
			</div>
			<div className="min-w-0 flex-1 px-4 [&>.category-item:not(:last-child)]:mb-1.5 border-l">
				<Skeleton className="transaction-type w-37.5 h-8" />
				<Skeleton className="transaction-amount mt-2 w-55 h-9" />
				<Skeleton className="chart mx-auto my-7.25 rounded-full w-48 aspect-square" />
				<Skeleton className="category-item w-full h-14" />
				<Skeleton className="category-item w-full h-14" />
				<Skeleton className="category-item w-full h-14" />
				<Skeleton className="category-item w-full h-14" />
			</div>
		</div>
	)
}

function DesktopStatsUI(props: StatsUIProps) {
	const formatAmount = useAmountFormatter()

	return (
		<div className="flex py-4 w-full min-w-0 max-w-full lg:m-auto rounded-lg border bg-card text-card-foreground shadow-xs">
			<div className="min-w-0 flex-1 px-4 group" data-is-positive="false">
				<h2 className="text-md">Total expense</h2>
				<h3 className="text-3xl text-entry-item">
					{formatAmount(props.stats?.totalExpense)}
				</h3>
				<ChartDisplay
					chartConfig={props.chartConfig}
					data={props.stats.groups
						.filter((value) => !value.isPositive)
						.map((v) => ({ ...v, category: truncate(v.category) }))}
					nameKey="category"
					dataKey="totalAmount"
				/>
			</div>
			<div
				className="min-w-0 flex-1 px-4 group border-l"
				data-is-positive="true"
			>
				<h2 className="text-md">Total income</h2>
				<h3 className="text-3xl text-entry-item">
					{formatAmount(props.stats?.totalIncome)}
				</h3>
				<ChartDisplay
					chartConfig={props.chartConfig}
					data={props.stats.groups
						.filter((value) => value.isPositive)
						.map((v) => ({ ...v, category: truncate(v.category) }))}
					nameKey="category"
					dataKey="totalAmount"
				/>
			</div>
		</div>
	)
}

export default function DashboardStatistics() {
	const [entryViewOptions, setEntryViewOptions] = useState<EntryViewOptions>(
		() => {
			const initial = getDefaultEntryViewOptions()
			initial.period.timeRange = DateHelper.getMonthStartEnd(new Date())
			return initial
		}
	)

	const settingsQuery = useSettingsQuery()
	const categoriesQuery = useCategoriesQuery()
	const entryData = useDashboardTransactionEntries(
		settingsQuery.data?.current_ledger,
		entryViewOptions
	)

	const isDesktop = useMediaQuery({ minWidth: DESKTOP_BREAKPOINT })
	const showButton = ["WEEKLY", "MONTHLY", "YEARLY"].includes(
		entryViewOptions.period.type
	)

	const renderStatsUI = () => {
		const isDataPending =
			entryData.isFetching || entryData.isLoading || entryData.isPending
		const stats = StatisticsHelper.calculateStatistics(entryData.data ?? [])
		const chartConfig: ChartConfig = {}

		for (let i = 0; i < stats.groups.length; i++) {
			const group = stats.groups[i]

			chartConfig[group.category!] = {
				label: group.category!
			}
		}

		const SkeletonUI = isDesktop ? DesktopSkeletonUI : MobileSkeletonUI
		const StatsUI = isDesktop ? DesktopStatsUI : MobileStatsUI

		return (
			<ConditionalWrapper
				showContent={!isDataPending}
				fallback={<SkeletonUI />}
			>
				<StatsUI chartConfig={chartConfig} stats={stats} />
			</ConditionalWrapper>
		)
	}

	return (
		<StatisticsPageContext.Provider value={{ viewOptions: entryViewOptions }}>
			<DashboardPageLayout title="Statistics">
				<div className="flex justify-between items-center pb-4 pt-2 bg-background">
					<ConditionalWrapper showContent={showButton} fallback={null}>
						<Button
							variant="ghost"
							className="aspect-square"
							onClick={() => {
								const type = entryViewOptions.period.type
								const currentDate = entryViewOptions.period.timeRange?.from
								if (!(type in changePeriod) || !isNonNullable(currentDate)) {
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
					<div className="w-full flex justify-center">
						<TimeFilterControlPanel
							settings={entryViewOptions}
							setSettings={setEntryViewOptions}
							allowSetTransactionType={false}
							availableCategories={categoriesQuery.data?.map((v) => ({
								name: v.name,
								count: -1
							}))}
						/>
					</div>
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
				{renderStatsUI()}
			</DashboardPageLayout>
		</StatisticsPageContext.Provider>
	)
}
