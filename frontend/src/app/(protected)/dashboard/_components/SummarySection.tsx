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
import { DateHelper } from "@/lib/helper/DateHelper"
import {
	StatisticsHelper,
	TotalSpendingByDay
} from "@/lib/helper/StatisticsHelper"
import { useAmountFormatter } from "@/lib/hooks"
import { useEntryDataQuery, useSettingsQuery } from "@/lib/queries"
import { isNonNullable } from "@/lib/utils"
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
	const [thisMonthRange] = useState(DateHelper.getMonthStartEnd(today))
	const [chartConfig] = useState({
		totalSpending: {
			label: "Total Spending",
			color: "var(--color-chart-2)"
		}
	} satisfies ChartConfig)

	const settingsQuery = useSettingsQuery()
	const formatAmount = useAmountFormatter()

	const ledgerId = settingsQuery.data?.current_ledger
	const entryDataQuery = useEntryDataQuery(ledgerId, thisMonthRange)

	const totalSpendingByDay = useMemo(() => {
		if (entryDataQuery.data === undefined) {
			return undefined
		}

		const calculatedGroups = StatisticsHelper.groupTotalSpendingByDate(
			entryDataQuery.data
		)
		const finalResult: TotalSpendingByDay[] = []

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
				finalResult.push({ date: new Date(curDate), totalSpending: 0 })
			}

			curDate.setDate(curDate.getDate() + 1)
		}

		return finalResult
	}, [entryDataQuery.data, thisMonthRange])

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
								<Area dataKey="totalSpending" />
								<XAxis
									dataKey="date"
									minTickGap={100}
									tickFormatter={(tick: Date) =>
										DateHelper.toDatabaseString(tick)
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
	const [thisMonthRange] = useState(DateHelper.getMonthStartEnd(today))
	const [chartConfig] = useState({} satisfies ChartConfig)

	const settingsQuery = useSettingsQuery()
	const ledgerId = settingsQuery.data?.current_ledger

	const formatAmount = useAmountFormatter()
	const entryDataQuery = useEntryDataQuery(ledgerId, thisMonthRange)
	const totalSpendingByCategory = useMemo(() => {
		return entryDataQuery.data === undefined
			? undefined
			: StatisticsHelper.groupTotalSpendingByCategory(entryDataQuery.data)
	}, [entryDataQuery.data])

	const tooltipContent = () => (
		<ChartTooltipContent
			formatterOverride={false}
			formatter={(value) => formatAmount(Number(value))}
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
									dataKey="totalSpending"
									data={totalSpendingByCategory}
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
	return (
		<div className="w-full mb-4">
			<h4 className="pb-4">Spending this month</h4>
			<div className="w-full gap-4 grid sm:grid-cols-[repeat(auto-fit,minmax(21rem,1fr))]">
				<SpendingByDateAreaChart />
				<SpendingByCategoryPieChart />
			</div>
		</div>
	)
}
