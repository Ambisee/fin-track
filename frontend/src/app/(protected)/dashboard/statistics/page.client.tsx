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
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import EntryList from "@/components/user/EntryList"
import MonthPicker from "@/components/user/MonthPicker"
import { DESKTOP_BREAKPOINT, MONTHS } from "@/lib/constants"
import { QueryHelper } from "@/lib/helper/QueryHelper"
import {
	useAmountFormatter,
	useEntryDataQuery,
	useSettingsQuery,
	useStatisticsQuery
} from "@/lib/hooks"
import useGlobalStore from "@/lib/store"
import { cn, isNonNullable } from "@/lib/utils"
import { Statistic } from "@/types/supabase"
import { useQueryClient } from "@tanstack/react-query"
import { X } from "lucide-react"
import { createContext, useContext, useEffect, useRef, useState } from "react"
import { useMediaQuery } from "react-responsive"
import { Cell, Pie, PieChart } from "recharts"

interface Statistics {
	totalIncome: number
	totalExpense: number
	groupByCategory: Group[]
}

interface Group extends Statistic {
	fillColor: string
	percentage: number
}

interface StatsUIProps {
	stats: Statistics
	chartConfig: ChartConfig
}

interface CategoryItemProps {
	value: Group
	period: Date
}

interface ChartDisplayProps {
	data?: Group[]
	chartConfig: ChartConfig
	dataKey: string
	nameKey: string
}

const StatisticsPageContext = createContext<{ period: Date }>(null!)

function ChartDisplay(props: ChartDisplayProps) {
	const { period } = useContext(StatisticsPageContext)

	const setData = useGlobalStore((state) => state.setData)
	const setOnSubmitSuccess = useGlobalStore((state) => state.setOnSubmitSuccess)

	const queryClient = useQueryClient()
	const settingsQuery = useSettingsQuery()
	const formatAmount = useAmountFormatter()
	const percentageKey = "percentage" as keyof Group

	if (props.data === undefined || !settingsQuery.data?.data?.current_ledger) {
		return <Skeleton className="w-full h-[250px] mt-5" />
	}

	if (props.data.length < 1) {
		return (
			<div className="h-[250px] flex items-center justify-center flex-col gap-2">
				<h2>No {props.dataKey} data entered for this period.</h2>
				<DialogTrigger
					asChild
					onClick={() => {
						setData(undefined)
						setOnSubmitSuccess((data) => {
							queryClient.invalidateQueries({
								queryKey: QueryHelper.getEntryQueryKey(
									data.ledger,
									new Date(data.date)
								)
							})
							queryClient.invalidateQueries({
								queryKey: QueryHelper.getStatisticQueryKey(
									data.ledger,
									new Date(data.date)
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
				className="mx-auto aspect-square w-fit max-w-[250px] min-h-[250px]"
			>
				<PieChart>
					<ChartTooltip
						content={
							<ChartTooltipContent
								formatterOverride={false}
								formatter={(value, name, item, index, payload: any) => {
									let result = formatAmount(value as number)
									if (percentageKey !== "percentage") {
										return result
									}

									return (
										result + ` (${(payload[percentageKey] * 100).toFixed(2)}%)`
									)
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
						{props.data.map((entry, index) => (
							<Cell key={`cell-${index}`} fill={entry.fillColor} />
						))}
					</Pie>
				</PieChart>
			</ChartContainer>
			<ul className="grid gap-1.5">
				{props.data
					.toSorted((a, b) => b.percentage - a.percentage)
					.map((value: Group) => {
						const dialogTitle = <></>

						return (
							<CategoryItem
								key={`${value.category}-${period.toDateString()}`}
								value={value}
								period={period}
							/>
						)
					})}
			</ul>
		</div>
	)
}

function CategoryItem(props: CategoryItemProps) {
	const settingsQuery = useSettingsQuery()
	const entryDataQuery = useEntryDataQuery(
		settingsQuery.data?.data?.current_ledger,
		props.period
	)

	const formatAmount = useAmountFormatter()

	return (
		<li key={props.value.category}>
			<Dialog>
				<DialogTrigger asChild>
					<button
						className={cn(
							buttonVariants({ variant: "ghost" }),
							"w-full flex items-center py-2 gap-2.5 text-md"
						)}
					>
						<div
							style={{ background: props.value.fillColor }}
							className={`w-6 aspect-square rounded-sm`}
						/>
						<span>
							{props.value.category}{" "}
							<span className="opacity-55">
								({((props.value.percentage as number) * 100).toFixed(2)}
								%)
							</span>
						</span>
						<span className="flex-1 text-right">
							{formatAmount(props.value.total_amount as number)}
						</span>
					</button>
				</DialogTrigger>
				<DialogContent
					hideCloseButton
					className="grid-rows-[auto_1fr] h-dvh max-w-none duration-0 border-0 sm:border sm:h-5/6 sm:min-h-[460px] sm:max-w-lg"
				>
					<DialogHeader className="relative space-y-0 sm:text-center">
						<DialogTitle className="mx-auto w-2/3 leading-6 lg:w-full" asChild>
							<h2 className="leading-6">
								<span className="whitespace-nowrap">
									{props.value.category}{" "}
									{props.value.is_positive ? "Income" : "Expense"}
								</span>{" "}
								<span className="whitespace-nowrap">
									({MONTHS[props.period.getMonth()]}{" "}
									{props.period.getFullYear()})
								</span>
							</h2>
						</DialogTitle>
						<DialogClose className="absolute block right-0 top-1/2 translate-y-[-50%]">
							<X className="w-4 h-4" />
						</DialogClose>
					</DialogHeader>
					<div className="h-full overflow-y-auto pr-1">
						<EntryList
							data={
								entryDataQuery.data?.data?.filter(
									(value) =>
										value.category === props.value.category &&
										value.is_positive == props.value.is_positive
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

function MobileStatsUI(props: StatsUIProps) {
	const [curTab, setCurTab] = useState<string>("expense")

	const incomeValRef = useRef<HTMLHeadingElement>(null!)
	const expenseValRef = useRef<HTMLHeadingElement>(null!)

	const resizeFontUntilFit = (el: HTMLHeadingElement) => {
		const parentBB = el.parentElement?.getBoundingClientRect()
		if (parentBB === undefined || el.textContent === null) {
			return
		}

		el.style.removeProperty("font-size")

		let fontSize = 30 // equals to 1.875rem as defined in the text-3xl TW class
		while (el.getBoundingClientRect().width > parentBB.width) {
			fontSize--
			el.style.fontSize = `${fontSize}px`
		}
	}

	useEffect(() => {
		resizeFontUntilFit(incomeValRef.current)
		resizeFontUntilFit(expenseValRef.current)
	}, [props.stats.totalIncome, props.stats.totalExpense])

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
						<h2 className="text-md group-data-[curtab='income']:opacity-55">
							Total expense
						</h2>
						<h3 className="text-2xl sm:text-3xl text-entry-item group-data-[curtab='income']:text-opacity-55">
							<span ref={expenseValRef}>
								{formatAmount(props.stats?.totalExpense)}
							</span>
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
						<h2 className="text-md group-data-[curtab='expense']:opacity-55">
							Total income
						</h2>
						<h3 className="text-2xl sm:text-3xl text-entry-item group-data-[curtab='expense']:text-opacity-55">
							<span ref={incomeValRef}>
								{formatAmount(props.stats?.totalIncome)}
							</span>
						</h3>
					</div>
				</TabsTrigger>
				<div
					className="
                        items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-muted 
                        absolute top-1 left-1 w-[calc(50%-0.25rem)] h-[calc(100%-0.5rem)] peer-data-[state=active]/income:translate-x-full peer-data-[state=active]/expense:translate-x-0
                        duration-300"
				></div>
			</TabsList>
			<TabsContent value="expense">
				<ChartDisplay
					chartConfig={props.chartConfig}
					data={props.stats.groupByCategory.filter(
						(value) => !value.is_positive
					)}
					nameKey="category"
					dataKey="total_amount"
				/>
			</TabsContent>
			<TabsContent value="income">
				<ChartDisplay
					chartConfig={props.chartConfig}
					data={props.stats.groupByCategory.filter(
						(value) => value.is_positive
					)}
					nameKey="category"
					dataKey="total_amount"
				/>
			</TabsContent>
		</Tabs>
	)
}

function DesktopStatsUI(props: StatsUIProps) {
	const formatAmount = useAmountFormatter()

	return (
		<div className="flex py-4 w-full lg:m-auto rounded-lg border bg-card text-card-foreground shadow-sm">
			<div className="flex-1 px-4 group" data-is-positive="false">
				<h2 className="text-md">Total expense</h2>
				<h3 className="text-3xl text-entry-item">
					{formatAmount(props.stats?.totalExpense)}
				</h3>
				<ChartDisplay
					chartConfig={props.chartConfig}
					data={props.stats.groupByCategory.filter(
						(value) => !value.is_positive
					)}
					nameKey="category"
					dataKey="total_amount"
				/>
			</div>
			<div className="flex-1 px-4 group border-l" data-is-positive="true">
				<h2 className="text-md">Total income</h2>
				<h3 className="text-3xl text-entry-item">
					{formatAmount(props.stats?.totalIncome)}
				</h3>
				<ChartDisplay
					chartConfig={props.chartConfig}
					data={props.stats.groupByCategory.filter(
						(value) => value.is_positive
					)}
					nameKey="category"
					dataKey="total_amount"
				/>
			</div>
		</div>
	)
}

export default function DashboardStatistics() {
	const [curPeriod, setCurPeriod] = useState<Date>(new Date())

	const settingsQuery = useSettingsQuery()
	const statisticsQuery = useStatisticsQuery(
		settingsQuery.data?.data?.current_ledger,
		curPeriod
	)
	const isDesktop = useMediaQuery({ minWidth: DESKTOP_BREAKPOINT })

	const calculateStats = () => {
		const result: Statistics = {
			totalIncome: 0,
			totalExpense: 0,
			groupByCategory: []
		}

		if (!statisticsQuery.data?.data) {
			return result
		}

		let colorIndex = 1
		for (let i = 0; i < statisticsQuery.data.data.length; i++) {
			const statistic: Statistic = statisticsQuery.data.data[i]
			if (!isNonNullable(statistic.total_amount)) {
				console.error("Expected a non-null value: statistic.total")
				continue
			}

			if (statistic.is_positive) {
				result.totalIncome += statistic.total_amount
			} else {
				result.totalExpense += statistic.total_amount
			}

			result.groupByCategory.push({
				...statistic,
				fillColor: `hsl(var(--chart-${colorIndex++}))`,
				percentage: 0
			})
		}

		for (let i = 0; i < result.groupByCategory.length; i++) {
			const group: Group = result.groupByCategory[i]
			if (!isNonNullable(group.total_amount)) {
				console.error("Expected a non-null value: group.total_amount")
				continue
			}

			const totalAmount = group.is_positive
				? result.totalIncome
				: result.totalExpense
			group.percentage = group.total_amount / totalAmount
		}

		return result
	}

	const renderStatsUI = () => {
		if (statisticsQuery.isFetching || !statisticsQuery.isFetched) {
			return (
				<div className="w-full py-4 flex gap-2 ">
					<div className="grid gap-2 flex-1">
						<Skeleton className="w-full h-6" />
						<Skeleton className="w-full h-9" />
					</div>
					<div className="grid gap-2 flex-1">
						<Skeleton className="w-full h-6" />
						<Skeleton className="w-full h-9" />
					</div>
				</div>
			)
		}

		const stats = calculateStats()
		const chartConfig: ChartConfig = {}

		for (let i = 0; i < stats.groupByCategory.length; i++) {
			const group = stats.groupByCategory[i]

			chartConfig[group.category!] = {
				label: group.category!
			}
		}

		const StatsUI = isDesktop ? DesktopStatsUI : MobileStatsUI

		return <StatsUI chartConfig={chartConfig} stats={stats} />
	}

	return (
		<StatisticsPageContext.Provider value={{ period: curPeriod }}>
			<div className="w-full h-full">
				<div className="w-full mb-4 flex justify-between items-center">
					<h1 className="text-3xl">Statistics</h1>
				</div>
				<div className="flex justify-between items-center pb-4 pt-2 bg-background">
					<MonthPicker
						key={`${curPeriod.getMonth()}-${curPeriod.getFullYear()}`}
						value={curPeriod}
						onValueChange={(value) => {
							setCurPeriod(value)
						}}
					/>
				</div>
				{renderStatsUI()}
			</div>
		</StatisticsPageContext.Provider>
	)
}
