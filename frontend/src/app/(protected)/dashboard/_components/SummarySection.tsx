import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent
} from "@/components/ui/chart"
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import ConditionalWrapper from "@/components/user/ConditionalWrapper"
import { EntryViewOptions } from "@/components/user/TimeFilterControlPanel"
import { MONTHS } from "@/lib/constants"
import { DateHelper } from "@/lib/helper/DateHelper"
import { StatisticsHelper, TotalByDay } from "@/lib/helper/StatisticsHelper"
import { useAmountFormatter, useDashboardTransactionEntries } from "@/lib/hooks"
import { useSettingsQuery } from "@/lib/queries"
import { isNonNullable, truncate } from "@/lib/utils"
import { useMemo, useState } from "react"
import { Area, AreaChart, Cell, Pie, PieChart, XAxis } from "recharts"

const chartContainerClassName = "min-h-0 w-full aspect-video"

function EmptyChart() {
	return (
		<Empty className={chartContainerClassName}>
			<EmptyHeader>
				<EmptyTitle>No transaction entries.</EmptyTitle>
				<EmptyDescription>
					Add transaction entries to view statistics.
				</EmptyDescription>
			</EmptyHeader>
		</Empty>
	)
}

function SpendingByDateAreaChart() {
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
	const [chartConfig] = useState({
		totalSpending: {
			label: "Total Spending",
			color: "var(--color-chart-2)"
		}
	} satisfies ChartConfig)

	const settingsQuery = useSettingsQuery()
	const formatAmount = useAmountFormatter()

	const ledgerId = settingsQuery.data?.current_ledger
	const entryDataQuery = useDashboardTransactionEntries(ledgerId, viewOptions)

	const totalSpendingByDay = useMemo(() => {
		if (entryDataQuery.data === undefined) {
			return undefined
		}

		const thisMonthRange = viewOptions.period.timeRange
		if (
			!isNonNullable(thisMonthRange?.from) ||
			!isNonNullable(thisMonthRange?.to)
		) {
			return undefined
		}

		const calculatedGroups = StatisticsHelper.groupTotalSpendingByDate(
			entryDataQuery.data
		)
		const finalResult: TotalByDay[] = []

		calculatedGroups.sort(
			(group1, group2) => group1.date.getTime() - group2.date.getTime()
		)
		const curDate = new Date(thisMonthRange.from)
		let index = 0

		while (!DateHelper.isDateEqual(curDate, thisMonthRange.to)) {
			if (
				index < calculatedGroups.length &&
				DateHelper.isDateEqual(calculatedGroups[index].date, curDate)
			) {
				finalResult.push(calculatedGroups[index])
				index++
			} else {
				finalResult.push({ date: new Date(curDate), total: 0 })
			}

			curDate.setDate(curDate.getDate() + 1)
		}

		return finalResult
	}, [entryDataQuery.data, viewOptions.period.timeRange])

	const tooltipContent = () => (
		<ChartTooltipContent
			indicator="line"
			formatterOverride={false}
			formatter={(value) => formatAmount(Number(value))}
			labelFormatter={(label, payload) => {
				const totalSpendingByDay = payload[0].payload
				const dateString = totalSpendingByDay.date.toDateString()
				return <>{dateString}</>
			}}
		/>
	)

	return (
		<Card>
			<CardHeader>
				<CardTitle>Spending by Date</CardTitle>
			</CardHeader>
			<CardContent>
				<ConditionalWrapper
					showContent={isNonNullable(totalSpendingByDay)}
					fallback={<Skeleton className={chartContainerClassName} />}
				>
					<ConditionalWrapper
						showContent={(entryDataQuery.data?.length ?? 0) > 0}
						fallback={<EmptyChart />}
					>
						<ChartContainer
							className={chartContainerClassName}
							config={chartConfig}
						>
							<AreaChart accessibilityLayer data={totalSpendingByDay}>
								<Area type="monotone" dataKey="total" />
								<XAxis
									dataKey="date"
									padding={{ left: 5, right: 5 }}
									minTickGap={10}
									tickFormatter={(tick: Date) =>
										DateHelper.toShortDateString(tick)
									}
								/>
								<ChartTooltip content={tooltipContent()} />
							</AreaChart>
						</ChartContainer>
					</ConditionalWrapper>
				</ConditionalWrapper>
			</CardContent>
		</Card>
	)
}

function SpendingByCategoryPieChart() {
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
	const [chartConfig] = useState({} satisfies ChartConfig)

	const settingsQuery = useSettingsQuery()
	const ledgerId = settingsQuery.data?.current_ledger

	const formatAmount = useAmountFormatter()
	const entryDataQuery = useDashboardTransactionEntries(ledgerId, viewOptions)

	const totalSpendingByCategory = useMemo(() => {
		if (entryDataQuery.data === undefined) {
			return undefined
		}

		const groups = StatisticsHelper.groupTotalSpendingByCategory(
			entryDataQuery.data
		)
		const groupSize = groups.length
		for (let i = 0; i < groupSize; i++) {
			groups[i].category = truncate(groups[i].category)
		}

		return groups
	}, [entryDataQuery.data])

	const totalSpending =
		totalSpendingByCategory
			?.map((v) => v.total)
			?.reduce((previous, current) => previous + current, 0) ?? 0

	const tooltipContent = () => (
		<ChartTooltipContent
			className="min-w-70 max-w-screen"
			formatterOverride={false}
			formatter={(value) => {
				const percentage = (100 * Number(value)) / totalSpending
				return `${formatAmount(Number(value))} (${percentage.toFixed(2)}%)`
			}}
		/>
	)

	return (
		<Card>
			<CardHeader>
				<CardTitle>Spending by Category</CardTitle>
			</CardHeader>
			<CardContent>
				<ConditionalWrapper
					showContent={isNonNullable(totalSpendingByCategory)}
					fallback={<Skeleton className={chartContainerClassName} />}
				>
					<ConditionalWrapper
						showContent={(totalSpendingByCategory?.length ?? 0) > 0}
						fallback={<EmptyChart />}
					>
						<ChartContainer
							className={chartContainerClassName}
							config={chartConfig}
						>
							<PieChart accessibilityLayer>
								<Pie
									nameKey="category"
									dataKey="total"
									data={totalSpendingByCategory}
									minAngle={10}
								>
									{totalSpendingByCategory?.map((value, index) => (
										<Cell
											className="transition-transform origin-center"
											key={value.category}
											fill={`var(--chart-${index + 1})`}
										/>
									))}
								</Pie>
								<ChartTooltip content={tooltipContent()} />
							</PieChart>
						</ChartContainer>
					</ConditionalWrapper>
				</ConditionalWrapper>
			</CardContent>
		</Card>
	)
}

export default function SummarySection() {
	const [curMonthText] = useState(() => {
		const today = new Date()
		return `${MONTHS[today.getMonth()]} ${today.getFullYear()}`
	})
	return (
		<div className="w-full mb-4">
			<div className="pb-4">
				<h4>Overview</h4>
				<p className="text-muted-foreground text-xs">{curMonthText}</p>
			</div>
			<div className="w-full gap-4 grid sm:grid-cols-[repeat(auto-fit,minmax(21rem,1fr))]">
				<SpendingByDateAreaChart />
				<SpendingByCategoryPieChart />
			</div>
		</div>
	)
}
