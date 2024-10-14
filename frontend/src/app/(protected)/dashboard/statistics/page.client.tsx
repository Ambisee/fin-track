"use client"

import {
	ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent
} from "@/components/ui/chart"
import { MONTHS } from "@/lib/constants"
import {
	useAmountFormatter,
	useEntryDataQuery,
	useSettingsQuery
} from "@/lib/hooks"
import { MonthGroup, filterDataGroup, groupDataByMonth } from "@/lib/utils"
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Label,
	Pie,
	PieChart,
	Sector,
	XAxis
} from "recharts"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { MonthPicker } from "@/components/user/MonthPicker"
import { Entry } from "@/types/supabase"
import { PieSectorDataItem } from "recharts/types/polar/Pie"

interface Statistics {
	totalIncome: number
	totalExpense: number
	groupByCategory: {
		name: string
		income: number
		expense: number
		data: Entry[]
		fill: string
	}[]
}

function DesktopUI() {}

export default function DashboardStatistics() {
	const [stats, setStats] = useState<Statistics>({
		totalIncome: 0,
		totalExpense: 0,
		groupByCategory: []
	})
	const [chartConfig, setChartConfig] = useState<ChartConfig>({})
	const [curPeriod, setCurPeriod] = useState<number[]>(() => {
		const today = new Date()
		return [today.getMonth(), today.getFullYear()]
	})

	const entryDataQuery = useEntryDataQuery()
	const formatAmount = useAmountFormatter()

	const dataGroups = useMemo(() => {
		if (entryDataQuery.isLoading) {
			return []
		}

		if (
			entryDataQuery.data === undefined ||
			entryDataQuery.data.data === null
		) {
			return []
		}

		const result = groupDataByMonth(entryDataQuery.data.data)
		if (result.length < 1) {
			const d = new Date()
			return [
				{
					month: MONTHS[d.getMonth()],
					year: d.getFullYear(),
					data: []
				}
			]
		}

		return result
	}, [entryDataQuery.data, entryDataQuery.isLoading])

	const calculateStats = (group: MonthGroup | undefined) => {
		const result: Statistics = {
			totalIncome: 0,
			totalExpense: 0,
			groupByCategory: []
		}

		if (group === undefined) {
			return result
		}

		let colorIndex = 1
		const keyToIndex = new Map()
		for (const entry of group.data) {
			if (!keyToIndex.has(entry.category)) {
				result.groupByCategory.push({
					name: entry.category,
					income: 0,
					expense: 0,
					data: [],
					fill: `hsl(var(--chart-${colorIndex}))`
				})

				keyToIndex.set(entry.category, result.groupByCategory.length - 1)
				colorIndex += 1
			}

			const entryGroup = result.groupByCategory[keyToIndex.get(entry.category)]
			entryGroup.data.push(entry)

			if (entry.is_positive) {
				result.totalIncome += entry.amount
				entryGroup.income += entry.amount
			} else {
				result.totalExpense += entry.amount
				entryGroup.expense += entry.amount
			}
		}

		return result
	}

	useEffect(() => {
		const newStats = calculateStats(
			filterDataGroup(curPeriod[0], curPeriod[1], dataGroups)
		)

		setStats(newStats)
		setChartConfig(() => {
			const result: ChartConfig = {}
			const keys = Object.keys(newStats.groupByCategory)

			for (let i = 0; i < keys.length; i++) {
				result[keys[i]] = {
					label: keys[i]
				}
			}

			return result
		})
	}, [curPeriod, dataGroups])

	return (
		<div>
			<h1 className="text-2xl">Statistics</h1>
			<div className="flex justify-between items-center pb-4 pt-2 bg-background">
				<Button
					className="w-12 h-12 rounded-full"
					variant="ghost"
					onClick={() =>
						setCurPeriod((c) => {
							const result = [c[0] - 1, c[1]]
							if (result[0] < 0) {
								result[0] = 11
								result[1] -= 1
							}

							return result
						})
					}
				>
					<ChevronLeft className="w-4 h-4" />
				</Button>
				<MonthPicker
					key={`${curPeriod[0]}-${curPeriod[1]}`}
					value={curPeriod}
					onValueChange={(value) => {
						setCurPeriod(value)
					}}
				/>
				<Button
					className="h-12 w-12 rounded-full"
					variant="ghost"
					onClick={() =>
						setCurPeriod((c) => {
							const result = [c[0] + 1, c[1]]
							result[1] += Math.floor(result[0] / 12)
							result[0] = result[0] % 12

							return result
						})
					}
				>
					<ChevronRight className="w-4 h-4" />
				</Button>
			</div>
			<div>
				<div className="py-4 flex lg:m-auto rounded-lg border bg-card text-card-foreground shadow-sm">
					<div className="flex-1 px-4 group border-r" data-is-positive="true">
						<h2 className="text-md">Total income</h2>
						<h1 className="text-3xl text-entry-item">
							{formatAmount(stats?.totalIncome)}
						</h1>
						<ChartContainer
							config={chartConfig}
							className="mx-auto aspect-square max-w-[250px] min-h-[250px]"
						>
							<PieChart>
								<ChartTooltip
									content={
										<ChartTooltipContent
											formatterOverride={false}
											formatter={(value) => formatAmount(value as number)}
										/>
									}
								/>
								<Pie
									data={stats.groupByCategory.filter(
										(entry) => entry.income !== 0
									)}
									isAnimationActive={false}
									dataKey="income"
									innerRadius={60}
								>
									{stats.groupByCategory.map((entry, index) => {
										if (entry.income === 0) {
											return undefined
										}
										return <Cell key={`cell-${index}`} fill={entry.fill} />
									})}
								</Pie>
							</PieChart>
						</ChartContainer>
						<ul>
							{stats.groupByCategory.map((value) => {
								if (value.income === 0) {
									return undefined
								}

								return (
									<li
										className="flex items-center py-2 gap-2.5"
										key={value.name}
									>
										<div
											style={{ background: value.fill }}
											className={`w-6 aspect-square rounded-sm`}
										/>
										<span>{value.name}</span>
										<span className="flex-1 border-dotted border-b-2" />
										<span className="text-right">
											{formatAmount(value.income)}
										</span>
									</li>
								)
							})}
						</ul>
					</div>
					<div className="flex-1 px-4 group" data-is-positive="false">
						<h2 className="text-md">Total expense</h2>
						<h1 className="text-3xl text-entry-item">
							{formatAmount(stats?.totalExpense)}
						</h1>
						<ChartContainer
							config={chartConfig}
							className="mx-auto aspect-square max-w-[250px] min-h-[250px]"
						>
							<PieChart>
								<ChartTooltip
									content={
										<ChartTooltipContent
											formatterOverride={false}
											formatter={(value) => formatAmount(value as number)}
										/>
									}
								/>
								<Pie
									isAnimationActive={false}
									data={stats.groupByCategory.filter(
										(entry) => entry.expense !== 0
									)}
									dataKey="expense"
									innerRadius={60}
								>
									{stats.groupByCategory.map((entry, index) => {
										if (entry.expense === 0) {
											return undefined
										}
										return <Cell key={`cell-${index}`} fill={entry.fill} />
									})}
								</Pie>
							</PieChart>
						</ChartContainer>
						<ul>
							{stats.groupByCategory.map((value) => {
								if (value.expense === 0) {
									return undefined
								}

								return (
									<li
										className="flex items-center py-2 gap-2.5"
										key={value.name}
									>
										<div
											style={{ background: value.fill }}
											className={`w-6 aspect-square rounded-sm`}
										/>
										<span>{value.name}</span>
										<span className="flex-1 border-dotted border-b-2" />
										<span className="text-right">
											{formatAmount(value.expense)}
										</span>
									</li>
								)
							})}
						</ul>
					</div>
				</div>
			</div>
		</div>
	)
}
