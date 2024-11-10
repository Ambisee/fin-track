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
import { MonthPicker } from "@/components/user/MonthPicker"
import {
	DESKTOP_BREAKPOINT,
	ENTRY_QKEY,
	MONTHS
} from "@/lib/constants"
import { useAmountFormatter, useEntryDataQuery } from "@/lib/hooks"
import useGlobalStore from "@/lib/store"
import { MonthGroup, cn, filterDataGroup, groupDataByMonth } from "@/lib/utils"
import { Entry } from "@/types/supabase"
import { useQueryClient } from "@tanstack/react-query"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState
} from "react"
import { useMediaQuery } from "react-responsive"
import { Cell, Pie, PieChart } from "recharts"
import { DashboardContext } from "../layout"

interface Group {
	name: string
	income: number
	expense: number
	incomePercentage: number
	expensePercentage: number
	data: Entry[]
	fill: string
}

interface Statistics {
	totalIncome: number
	totalExpense: number
	groupByCategory: Group[]
}

interface StatsUIProps {
	stats: Statistics
	chartConfig: ChartConfig
}

interface ChartDisplayProps {
	data?: any[]
	chartConfig: ChartConfig
	dataKey: "income" | "expense"
}

const StatisticsPageContext = createContext<{ period: number[] }>(null!)

function ChartDisplay(props: ChartDisplayProps) {
	const { period } = useContext(StatisticsPageContext)

	const setData = useGlobalStore((state) => state.setData)
	const setOnSubmitSuccess = useGlobalStore((state) => state.setOnSubmitSuccess)

	const queryClient = useQueryClient()
	const formatAmount = useAmountFormatter()
	const percentageKey = props.dataKey.concat("Percentage") as keyof Group

	const data = useMemo(() => {
		if (!props.data) {
			return []
		}

		return props.data.filter((entry) => entry[props.dataKey] !== 0)
	}, [props.data, props.dataKey])

	if (props.data === undefined) {
		return <Skeleton className="w-full h-[250px] mt-5" />
	}

	if (data.length < 1) {
		return (
			<div className="h-[250px] flex items-center justify-center flex-col gap-2">
				<h1>No {props.dataKey} data entered for this period.</h1>
				<DialogTrigger
					asChild
					onClick={() => {
						setData(undefined)
						setOnSubmitSuccess((data) => {
							queryClient.invalidateQueries({ queryKey: ENTRY_QKEY })
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
									if (
										percentageKey !== "incomePercentage" &&
										percentageKey !== "expensePercentage"
									) {
										return result
									}

									return (
										result + ` (${(payload[percentageKey] * 100).toFixed(2)}%)`
									)
								}}
							/>
						}
					/>
					<Pie data={data} isAnimationActive={false} dataKey={props.dataKey}>
						{props.data.map((entry, index) => {
							if (entry[props.dataKey] === 0) {
								return undefined
							}
							return <Cell key={`cell-${index}`} fill={entry.fill} />
						})}
					</Pie>
				</PieChart>
			</ChartContainer>
			<ul className="grid gap-1.5">
				{props.data
					.toSorted((a, b) => b[percentageKey] - a[percentageKey])
					.map((value: Group) => {
						if (value[props.dataKey] === 0) {
							return undefined
						}

						const entryData = value.data.filter(
							(entry) =>
								(props.dataKey === "income" && entry.is_positive) ||
								(props.dataKey === "expense" && !entry.is_positive)
						)
						// const dialogTitle = `${value.name} ${props.dataKey}s (${
						// 	MONTHS[period[0]]
						// } ${period[1]})`
						const dialogTitle = (
							<>
								<span className="whitespace-nowrap">
									{value.name} {props.dataKey}
								</span>{" "}
								<span className="whitespace-nowrap">
									({MONTHS[period[0]]} {period[1]})
								</span>
							</>
						)

						return (
							<li key={value.name}>
								<Dialog>
									<DialogTrigger asChild>
										<button
											className={cn(
												buttonVariants({ variant: "ghost" }),
												"w-full flex items-center py-2 gap-2.5 text-md"
											)}
										>
											<div
												style={{ background: value.fill }}
												className={`w-6 aspect-square rounded-sm`}
											/>
											<span>
												{value.name}{" "}
												<span className="opacity-55">
													({((value[percentageKey] as number) * 100).toFixed(2)}
													%)
												</span>
											</span>
											<span className="flex-1 text-right">
												{formatAmount(value[props.dataKey] as number)}
											</span>
										</button>
									</DialogTrigger>
									<DialogContent
										hideCloseButton
										className="grid-rows-[auto_1fr] h-dvh max-w-none duration-0 border-0 sm:border sm:h-5/6 sm:min-h-[460px] sm:max-w-lg"
									>
										<DialogHeader className="relative space-y-0 sm:text-center">
											<DialogTitle
												className="mx-auto w-2/3 leading-6 lg:w-full"
												asChild
											>
												<h1 className="leading-6">{dialogTitle}</h1>
											</DialogTitle>
											<DialogClose className="absolute block right-0 top-1/2 translate-y-[-50%]">
												<X className="w-4 h-4" />
											</DialogClose>
										</DialogHeader>
										<div className="overflow-y-auto pr-1">
											<EntryList data={entryData} showButtons={false} />
										</div>
									</DialogContent>
								</Dialog>
							</li>
						)
					})}
			</ul>
		</div>
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
	const entryDataQuery = useEntryDataQuery()

	return (
		<Tabs value={curTab} onValueChange={setCurTab}>
			<TabsList className="w-full h-full mb-4 bg-background border rounded-sm">
				<TabsTrigger
					value="expense"
					className="w-1/2 text-left bg-background data-[state=active]:bg-muted group"
					data-is-positive="false"
					data-curtab={curTab}
				>
					<div className="w-full">
						<h2 className="text-md group-data-[curtab='income']:opacity-55">
							Total expense
						</h2>
						<h1 className="text-2xl sm:text-3xl text-entry-item group-data-[curtab='income']:text-opacity-55">
							<span ref={expenseValRef}>
								{formatAmount(props.stats?.totalExpense)}
							</span>
						</h1>
					</div>
				</TabsTrigger>
				<TabsTrigger
					value="income"
					className="w-1/2 text-left bg-background data-[state=active]:bg-muted group"
					data-curtab={curTab}
					data-is-positive="true"
				>
					<div className="w-full">
						<h2 className="text-md group-data-[curtab='expense']:opacity-55">
							Total income
						</h2>
						<h1 className="text-2xl sm:text-3xl text-entry-item group-data-[curtab='expense']:text-opacity-55">
							<span ref={incomeValRef}>
								{formatAmount(props.stats?.totalIncome)}
							</span>
						</h1>
					</div>
				</TabsTrigger>
			</TabsList>
			<TabsContent value="expense">
				<ChartDisplay
					chartConfig={props.chartConfig}
					data={
						entryDataQuery.data === undefined
							? undefined
							: props.stats.groupByCategory
					}
					dataKey="expense"
				/>
			</TabsContent>
			<TabsContent value="income">
				<ChartDisplay
					chartConfig={props.chartConfig}
					data={
						entryDataQuery.data === undefined
							? undefined
							: props.stats.groupByCategory
					}
					dataKey="income"
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
				<h1 className="text-3xl text-entry-item">
					{formatAmount(props.stats?.totalExpense)}
				</h1>
				<ChartDisplay
					chartConfig={props.chartConfig}
					data={
						props.stats.groupByCategory === undefined
							? undefined
							: props.stats.groupByCategory
					}
					dataKey="expense"
				/>
			</div>
			<div className="flex-1 px-4 group border-l" data-is-positive="true">
				<h2 className="text-md">Total income</h2>
				<h1 className="text-3xl text-entry-item">
					{formatAmount(props.stats?.totalIncome)}
				</h1>
				<ChartDisplay
					chartConfig={props.chartConfig}
					data={
						props.stats.groupByCategory === undefined
							? undefined
							: props.stats.groupByCategory
					}
					dataKey="income"
				/>
			</div>
		</div>
	)
}

export default function DashboardStatistics() {
	const [curPeriod, setCurPeriod] = useState<number[]>(() => {
		const today = new Date()
		return [today.getMonth(), today.getFullYear()]
	})

	const entryDataQuery = useEntryDataQuery()
	const { dataGroups } = useContext(DashboardContext)
	const isDesktop = useMediaQuery({
		minWidth: DESKTOP_BREAKPOINT
	})

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
					incomePercentage: 0,
					expensePercentage: 0,
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

		for (const group of result.groupByCategory) {
			group.expensePercentage = group.expense / result.totalExpense
			group.incomePercentage = group.income / result.totalIncome
		}

		return result
	}

	const renderStatsUI = () => {
		if (entryDataQuery.data === undefined) {
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

		const stats = calculateStats(
			filterDataGroup(curPeriod[0], curPeriod[1], dataGroups)
		)

		const chartConfig: ChartConfig = {}
		const keys = Object.keys(stats.groupByCategory)

		for (let i = 0; i < keys.length; i++) {
			chartConfig[keys[i]] = {
				label: keys[i]
			}
		}

		const StatsUI = isDesktop ? DesktopStatsUI : MobileStatsUI

		return <StatsUI chartConfig={chartConfig} stats={stats} />
	}

	const renderMonthPicker = () => {
		if (entryDataQuery.data === undefined) {
			return (
				<div className="w-full flex justify-between items-center py-4">
					<Skeleton className="w-12 h-12 rounded-full" />
					<Skeleton className="w-36 h-12" />
					<Skeleton className="w-12 h-12 rounded-full" />
				</div>
			)
		}

		return (
			<div className="flex justify-between items-center py-4 bg-background">
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
		)
	}

	return (
		<StatisticsPageContext.Provider value={{ period: curPeriod }}>
			<div className="w-full h-full pb-8 md:pb-0">
				<h1 className="text-3xl">Statistics</h1>
				{renderMonthPicker()}
				{renderStatsUI()}
			</div>
		</StatisticsPageContext.Provider>
	)
}
