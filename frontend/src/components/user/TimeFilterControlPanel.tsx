import { MONTHS } from "@/lib/constants"
import { DateHelper, DateRange } from "@/lib/helper/DateHelper"
import { isNonNullable, isSetStateFunction } from "@/lib/utils"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { CommandGroup, useCommandState } from "cmdk"
import { Check, ChevronLeft, ChevronRight, X } from "lucide-react"
import {
	Dispatch,
	ReactNode,
	SetStateAction,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState
} from "react"
import { useMediaQuery } from "react-responsive"
import { Button } from "../ui/button"
import {
	Command,
	CommandEmpty,
	CommandInput,
	CommandItem,
	CommandList
} from "../ui/command"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from "../ui/dialog"
import { FieldGroup } from "../ui/field"
import { InputGroup, InputGroupButton, InputGroupText } from "../ui/input-group"
import { Item, ItemContent, ItemTitle } from "../ui/item"
import { Separator } from "../ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { EntryFormItem } from "./EntryForm/EntryForm"

const PERIOD_TYPE = {
	TODAY: { label: "Today" },
	YESTERDAY: { label: "Yesterday" },
	LAST_7_DAYS: { label: "Last 7 Days" },
	WEEKLY: { label: "Weekly" },
	MONTHLY: { label: "Monthly" },
	YEARLY: { label: "Yearly" }
} as const

const TRANSACTION_TYPE = ["All", "Expense", "Income"] as const

type PeriodType = keyof typeof PERIOD_TYPE
type TransactionType = (typeof TRANSACTION_TYPE)[number]

interface CategoryItem {
	name: string
	count: number
}

interface TimeSettings {
	type: PeriodType
	timeRange: DateRange | undefined
}

interface FilterSettings {
	type: TransactionType
	categories: string[] | undefined
	amountRange: [number, number] | undefined
}

interface EntryDisplaySettings {
	period: TimeSettings
	filter: FilterSettings
}

const changePeriod: {
	[key: string]: (curDate: Date, offset: number) => DateRange
} = {
	WEEKLY: (curDate, offset) => {
		const curWeek = DateHelper.getWeekStartEnd(curDate)

		let newWeekDate = new Date(curDate)
		if (offset < 0) {
			newWeekDate = new Date(curWeek?.from ?? new Date())
			newWeekDate.setDate(newWeekDate.getDate() - 1)
		} else if (offset > 0) {
			newWeekDate = new Date(curWeek?.to ?? new Date())
			newWeekDate.setDate(newWeekDate.getDate() + 1)
		}

		const answer = DateHelper.getWeekStartEnd(newWeekDate)
		return answer
	},
	MONTHLY: (curDate, offset) => {
		const curMonth = DateHelper.getMonthStartEnd(curDate)

		const newMonthDate = new Date(curMonth?.from ?? new Date())
		newMonthDate.setDate(15)
		if (offset < 0) {
			newMonthDate.setMonth(newMonthDate.getMonth() - 1)
		} else if (offset > 0) {
			newMonthDate.setMonth(newMonthDate.getMonth() + 1)
		}

		const answer = DateHelper.getMonthStartEnd(newMonthDate)
		return answer
	},
	YEARLY: (curDate, offset) => {
		const curYear = DateHelper.getYearStartEnd(curDate)

		const newYearDate = new Date(curYear?.from ?? new Date())
		newYearDate.setDate(15)
		if (offset < 0) {
			newYearDate.setFullYear(newYearDate.getFullYear() - 1)
		} else if (offset > 0) {
			newYearDate.setFullYear(newYearDate.getFullYear() + 1)
		}

		const answer = DateHelper.getYearStartEnd(newYearDate)
		return answer
	}
} as const

const defaultSettings: EntryDisplaySettings = {
	period: { type: "MONTHLY", timeRange: undefined },
	filter: { type: "All", categories: undefined, amountRange: undefined }
}

function useTinyScreenMediaQuery() {
	return useMediaQuery({ maxWidth: "375px" })
}

function TimeRangeSelector(props: {
	value: DateRange | undefined
	valueOverride?: string
	onChange: (arg: number) => void
}) {
	const shouldUseShort = useTinyScreenMediaQuery()

	let startDateString: string
	let endDateString: string

	const start = props.value?.from ?? new Date()
	const end = props.value?.to ?? new Date()
	if (shouldUseShort) {
		startDateString = DateHelper.toShortString(start)
		endDateString = DateHelper.toShortString(end)
	} else {
		startDateString = DateHelper.toFullString(start)
		endDateString = DateHelper.toFullString(end)
	}

	return (
		<div className="w-full flex items-center justify-between">
			<Button
				variant="ghost"
				className="size-8 rounded-full"
				onClick={() => props.onChange(-1)}
			>
				<ChevronLeft />
			</Button>
			<span className="text-center">
				{props.valueOverride ?? `${startDateString} - ${endDateString}`}
			</span>
			<Button
				variant="ghost"
				className="size-8 rounded-full"
				onClick={() => props.onChange(1)}
			>
				<ChevronRight />
			</Button>
		</div>
	)
}

function TimePeriodControlTabHeader(props: {
	value: TimeSettings
	onChange: Dispatch<SetStateAction<TimeSettings>>
}) {
	let header: ReactNode
	const today = new Date()

	switch (props.value.type) {
		case "TODAY":
			header = DateHelper.toFullString(today)
			break
		case "YESTERDAY":
			const yesterday = new Date()
			yesterday.setDate(yesterday.getDate() - 1)
			header = DateHelper.toFullString(yesterday)
			break
		case "LAST_7_DAYS":
			const startDate = new Date()
			startDate.setDate(startDate.getDate() - 7)
			header = (
				<div className="flex justify-between items-center w-full">
					<span>{DateHelper.toFullString(startDate)}</span>
					<span>-</span>
					<span> {DateHelper.toFullString(today)}</span>
				</div>
			)
			break
		case "WEEKLY":
			header = (
				<TimeRangeSelector
					value={props.value.timeRange}
					onChange={(offset) => {
						props.onChange((cur) => {
							const newValue = { ...cur }
							newValue.timeRange = changePeriod.WEEKLY(
								cur.timeRange?.from ?? new Date(),
								offset
							)

							return newValue
						})
					}}
				/>
			)
			break
		case "MONTHLY":
			const monthDate = new Date(props.value.timeRange?.from ?? 0)
			header = (
				<TimeRangeSelector
					value={props.value.timeRange}
					valueOverride={`${MONTHS[monthDate.getMonth()]} ${monthDate.getFullYear()}`}
					onChange={(offset) => {
						props.onChange((cur) => {
							const newValue = { ...cur }
							newValue.timeRange = changePeriod.MONTHLY(
								cur.timeRange?.from ?? new Date(),
								offset
							)

							return newValue
						})
					}}
				/>
			)
			break
		case "YEARLY":
			const yearDate = new Date(props.value.timeRange?.from ?? 0)
			header = (
				<TimeRangeSelector
					value={props.value.timeRange}
					valueOverride={`${yearDate.getFullYear()}`}
					onChange={(offset) => {
						props.onChange((cur) => {
							const newValue = { ...cur }
							newValue.timeRange = changePeriod.YEARLY(
								cur.timeRange?.from ?? new Date(),
								offset
							)
							return newValue
						})
					}}
				/>
			)
			break
	}

	return (
		<div className="min-h-8 flex items-center text-muted-foreground">
			{header}
		</div>
	)
}

function TimePeriodControlTab(props: {
	tabValue: string
	timeSettings: TimeSettings
	onTimeSettings: Dispatch<SetStateAction<TimeSettings>>
}) {
	const renderPeriodTypeButtons = () => {
		const buttons = []

		const periodTypes = Object.keys(PERIOD_TYPE) as (keyof typeof PERIOD_TYPE)[]
		for (const type of periodTypes) {
			buttons.push(
				<Button
					key={type}
					className="w-full justify-between"
					variant="ghost"
					onClick={() =>
						props.onTimeSettings((cur) => {
							const newValue = { ...cur, type }
							const today = new Date()

							switch (type) {
								case "WEEKLY":
									newValue.timeRange = DateHelper.getWeekStartEnd(today)
									break
								case "MONTHLY":
									newValue.timeRange = DateHelper.getMonthStartEnd(today)
									break
								case "YEARLY":
									newValue.timeRange = DateHelper.getYearStartEnd(today)
									break
								default:
									newValue.timeRange = undefined
									break
							}

							return newValue
						})
					}
				>
					{PERIOD_TYPE[type].label}
					{props.timeSettings.type === type && <Check />}
				</Button>
			)
		}

		return buttons
	}

	return (
		<TabsContent value={props.tabValue}>
			<div className="grid gap-2">
				<Item variant="muted">
					<ItemContent>
						<ItemTitle>{PERIOD_TYPE[props.timeSettings.type].label}</ItemTitle>
						<TimePeriodControlTabHeader
							value={props.timeSettings}
							onChange={props.onTimeSettings}
						/>
					</ItemContent>
				</Item>
				{renderPeriodTypeButtons()}
			</div>
		</TabsContent>
	)
}

function FilterCommandInput(props: {
	value: string
	onChange: Dispatch<SetStateAction<string>>
}) {
	const filtered = useCommandState((state) => state.filtered)

	return (
		<CommandInput
			value={props.value}
			onValueChange={props.onChange}
			placeholder="Search for a category"
			className="w-full h-9"
			onKeyDown={(e) => {
				if (e.key === "Enter" && filtered.count > 0) {
					props.onChange("")
				}
			}}
		/>
	)
}

function TransactionTypeSelector(props: {
	value: TransactionType
	onChange: Dispatch<SetStateAction<TransactionType>>
}) {
	const [firstType] = useState(props.value)

	const hoverBgRef = useRef<HTMLDivElement>(null)
	const typeAllRef = useRef<HTMLButtonElement>(null)
	const typeExpenseRef = useRef<HTMLButtonElement>(null)
	const typeIncomeRef = useRef<HTMLButtonElement>(null)

	const computeXPos = (type: TransactionType) => {
		switch (type) {
			case TRANSACTION_TYPE[0]:
				return typeAllRef?.current?.offsetLeft ?? 0
			case TRANSACTION_TYPE[1]:
				return typeExpenseRef?.current?.offsetLeft ?? 0
			case TRANSACTION_TYPE[2]:
				return typeIncomeRef?.current?.offsetLeft ?? 0
			default:
				return 0
		}
	}

	const computeWidth = (type: TransactionType) => {
		switch (type) {
			case TRANSACTION_TYPE[0]:
				return typeAllRef?.current?.offsetWidth ?? 0
			case TRANSACTION_TYPE[1]:
				return typeExpenseRef?.current?.offsetWidth ?? 0
			case TRANSACTION_TYPE[2]:
				return typeIncomeRef?.current?.offsetWidth ?? 0
			default:
				return 0
		}
	}

	useLayoutEffect(() => {
		const hoverBg = hoverBgRef.current as HTMLDivElement
		hoverBg.style.width = `${computeWidth(firstType)}px`
		hoverBg.style.translate = `${computeXPos(firstType)}px 0`
	}, [firstType])

	useEffect(() => {
		const hoverBg = hoverBgRef.current as HTMLDivElement
		const resizeCallback = () => {
			hoverBg.style.width = `${computeWidth(props.value)}px`
			hoverBg.style.translate = `${computeXPos(props.value)}px 0`
		}

		hoverBg.classList.add("transition-all")
		window.addEventListener("resize", resizeCallback)

		return () => {
			window.removeEventListener("resize", resizeCallback)
		}
	}, [props.value])

	return (
		<Tabs
			value={props.value}
			onValueChange={(value) => props.onChange(value as TransactionType)}
			defaultValue={TRANSACTION_TYPE[0]}
		>
			<TabsList className="w-full relative">
				<TabsTrigger
					className="data-[state=active]:bg-transparent z-2 w-full"
					ref={typeAllRef}
					value={TRANSACTION_TYPE[0]}
				>
					{TRANSACTION_TYPE[0]}
				</TabsTrigger>
				<TabsTrigger
					className="data-[state=active]:bg-transparent z-2 w-full"
					ref={typeExpenseRef}
					value={TRANSACTION_TYPE[1]}
				>
					{TRANSACTION_TYPE[1]}
				</TabsTrigger>
				<TabsTrigger
					className="data-[state=active]:bg-transparent z-2 w-full"
					ref={typeIncomeRef}
					value={TRANSACTION_TYPE[2]}
				>
					{TRANSACTION_TYPE[2]}
				</TabsTrigger>
				<div
					ref={hoverBgRef}
					className="absolute top-1 left-0 bg-background rounded-md h-[calc(100%-0.5rem)]"
					style={{
						// eslint-disable-next-line react-hooks/refs
						translate: `${computeXPos(props.value)}px 0`,
						// eslint-disable-next-line react-hooks/refs
						width: `${computeWidth(props.value)}px`
					}}
				/>
			</TabsList>
		</Tabs>
	)
}

function FilterControlTab(props: {
	tabValue: string
	categories?: string[]
	filterSettings: FilterSettings
	onFilterSettings: Dispatch<SetStateAction<FilterSettings>>
}) {
	const availableCategories = props?.categories ?? [
		"Miscellaneous",
		"Food",
		"Transportation",
		"Salary",
		"Investment",
		"Bonus",
		"Grocery",
		"Utilities",
		"Rent"
	]

	const [searchValue, setSearchValue] = useState("")
	const categories = props.filterSettings.categories

	return (
		<TabsContent value={props.tabValue}>
			<form onSubmit={(e) => e.preventDefault()}>
				<FieldGroup className="h-fit *:text-left grid gap-4">
					<EntryFormItem
						label="Type"
						className="items-start [&_label]:h-8 [&_label]:align-middle [&_label]:leading-8"
					>
						<TransactionTypeSelector
							value={props.filterSettings.type}
							onChange={(v) => {
								props.onFilterSettings((c) => ({
									...c,
									type: isSetStateFunction(v) ? v(c.type) : v
								}))
							}}
						/>
					</EntryFormItem>
					<EntryFormItem
						label="Categories"
						className="items-start [&_label]:h-10 [&_label]:align-middle [&_label]:leading-10"
					>
						<InputGroup className="overflow-hidden">
							<InputGroupText className="w-full pl-2">
								{categories && categories.length !== availableCategories.length
									? `${categories.length} selected.`
									: "All selected."}
							</InputGroupText>
							<Separator orientation="vertical" />
							<InputGroupButton
								onClick={() =>
									props.onFilterSettings((cur) => ({
										...cur,
										categories: undefined
									}))
								}
								className="h-full rounded-none"
							>
								Clear
							</InputGroupButton>
						</InputGroup>
						<Command className="bg-transparent outline-1">
							<FilterCommandInput
								value={searchValue}
								onChange={setSearchValue}
							/>
							<CommandList className="h-48 relative overflow-y-scroll pointer-events-auto">
								<CommandEmpty>No category found.</CommandEmpty>
								<CommandGroup>
									{availableCategories.map((value) => (
										<CommandItem
											className="justify-between cursor-pointer"
											value={value}
											key={value}
											onSelect={(v) =>
												props.onFilterSettings((cur) => {
													const categories = cur.categories
													if (categories === undefined) {
														return { ...cur, categories: [v] }
													}

													if (categories.includes(v)) {
														const newValue = categories.filter(
															(val) => val !== v
														)
														if (newValue.length === 0)
															return { ...cur, categories: undefined }
														return { ...cur, categories: newValue }
													}

													return { ...cur, categories: [...categories, v] }
												})
											}
										>
											<span>{value}</span>
											{(categories ?? []).includes(value) && <Check />}
										</CommandItem>
									))}
								</CommandGroup>
							</CommandList>
						</Command>
					</EntryFormItem>
				</FieldGroup>
			</form>
		</TabsContent>
	)
}

function TimeFilterControlDialogContent(props: {
	settings: EntryDisplaySettings
	onSettingsChange: Dispatch<SetStateAction<EntryDisplaySettings>>
	availableCategories?: CategoryItem[]
}) {
	const [timeSettings, setTimeSettings] = useControlPropState<TimeSettings>(
		defaultSettings.period,
		props.settings.period,
		(value) =>
			props.onSettingsChange((cur) => ({
				...cur,
				period: isSetStateFunction(value) ? value(cur.period) : value
			}))
	)
	const [filterSettings, setFilterSettings] =
		useControlPropState<FilterSettings>(
			defaultSettings.filter,
			props.settings.filter,
			(value) =>
				props.onSettingsChange((cur) => ({
					...cur,
					filter: isSetStateFunction(value) ? value(cur.filter) : value
				}))
		)

	return (
		<DialogContent
			hideCloseButton
			className="grid-rows-[auto_1fr] h-dvh max-w-none duration-0 border-0 sm:border sm:h-[90%] sm:min-h-115 sm:max-w-lg"
			onCloseAutoFocus={() =>
				props.onSettingsChange({ period: timeSettings, filter: filterSettings })
			}
		>
			<DialogHeader className="relative space-y-0 sm:text-center">
				<DialogTitle>View Options</DialogTitle>
				<DialogDescription>
					<VisuallyHidden>
						Customize the settings for viewing your transactions.
					</VisuallyHidden>
				</DialogDescription>
				<DialogClose className="absolute block right-0 top-1/2 translate-y-[-50%]">
					<X className="w-4 h-4" />
				</DialogClose>
			</DialogHeader>
			<Tabs defaultValue="timePeriod">
				<TabsList className="w-full relative mb-4">
					<TabsTrigger
						className="
                            peer/timePeriod
                            w-1/2 z-50 data-[state=active]:bg-transparent text-center"
						value="timePeriod"
					>
						Period Type
					</TabsTrigger>
					<TabsTrigger
						className="
                            peer/filter
                            w-1/2 z-50 data-[state=active]:bg-transparent text-center"
						value="filter"
					>
						Filter
					</TabsTrigger>
					<div
						className="
                            items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 font-medium ring-offset-background transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-background 
                            absolute top-1 left-1 w-[calc(50%-0.25rem)] h-[calc(100%-0.5rem)] peer-data-[state=active]/filter:translate-x-full peer-data-[state=active]/timePeriod:translate-x-0
                            duration-300"
					></div>
				</TabsList>
				<TimePeriodControlTab
					timeSettings={timeSettings}
					onTimeSettings={setTimeSettings}
					tabValue="timePeriod"
				/>
				<FilterControlTab
					tabValue="filter"
					filterSettings={filterSettings}
					onFilterSettings={setFilterSettings}
					categories={props.availableCategories?.map((value) => value.name)}
				/>
			</Tabs>
		</DialogContent>
	)
}

function useControlPropState<T>(
	defaultValue: T,
	state?: T,
	setState?: Dispatch<SetStateAction<T>>
) {
	const defaultState = useState<T>(defaultValue)

	if (state !== undefined && setState !== undefined)
		return [state, setState] as const
	return defaultState
}

export default function TimeFilterControlPanel(props: {
	settings?: EntryDisplaySettings
	setSettings?: Dispatch<SetStateAction<EntryDisplaySettings>>
	availableCategories?: CategoryItem[]
}) {
	const [entryDisplaySettings, setEntryDisplaySettings] = useControlPropState(
		defaultSettings,
		props.settings,
		props.setSettings
	)

	const shouldUseShort = useTinyScreenMediaQuery()
	const triggerText = useMemo(() => {
		let result: ReactNode = ""
		const period = entryDisplaySettings.period
		switch (period.type) {
			case "TODAY":
				result = PERIOD_TYPE.TODAY.label
				break
			case "YESTERDAY":
				result = PERIOD_TYPE.YESTERDAY.label
				break
			case "LAST_7_DAYS":
				result = PERIOD_TYPE.LAST_7_DAYS.label
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
					result = `${DateHelper.toShortString(from)} - ${DateHelper.toShortString(to)}`
				} else {
					result = `${DateHelper.toFullString(from)} - ${DateHelper.toFullString(to)}`
				}
				break
			case "MONTHLY":
				const monthDate = new Date(period.timeRange?.from ?? 0)
				result = `${MONTHS[monthDate.getMonth()]} ${monthDate.getFullYear()}`
				break
			case "YEARLY":
				const yearDate = new Date(period.timeRange?.from ?? 0)
				result = `${yearDate.getFullYear()}`
				break
		}

		return result
	}, [entryDisplaySettings.period])

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button className="h-max" variant="ghost">
					{triggerText}
				</Button>
			</DialogTrigger>
			<TimeFilterControlDialogContent
				settings={entryDisplaySettings}
				onSettingsChange={setEntryDisplaySettings}
				availableCategories={props.availableCategories}
			/>
		</Dialog>
	)
}

export { PERIOD_TYPE, changePeriod, type EntryDisplaySettings }
