"use client"

import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import {
	DOCUMENT_QKEY,
	MONTHS,
	SERVER_PING_QKEY,
	SERVER_STATUS,
	SHORT_TOAST_DURATION
} from "@/lib/constants"
import { FetchError } from "@/lib/errors/FetchError"
import { QueryHelper } from "@/lib/helper/QueryHelper"
import {
	useLedgersQuery,
	useMonthGroupQuery,
	useServerPingQuery,
	useSettingsQuery,
	useUserQuery
} from "@/lib/hooks"
import useGlobalStore from "@/lib/store"
import { Ledger, MonthGroup } from "@/types/supabase"
import { DownloadIcon, ReloadIcon } from "@radix-ui/react-icons"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import {
	CancelledError,
	QueryClient,
	useIsFetching,
	useQueryClient
} from "@tanstack/react-query"
import { ChevronLeft, ChevronRight, Circle, X } from "lucide-react"
import {
	Dispatch,
	ReactElement,
	SetStateAction,
	useState,
	type JSX
} from "react"

import classNames from "@/styles/flicker-ellipse-animation.module.css"

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

function refreshServerStatus(queryClient: QueryClient) {
	queryClient.setQueryData(SERVER_PING_QKEY, () => SERVER_STATUS.LOADING)
	queryClient.refetchQueries({ queryKey: SERVER_PING_QKEY })
}

function ServerStatusLabel() {
	const queryClient = useQueryClient()
	const serverPingQuery = useServerPingQuery()

	let serverIconClassName: string
	let serverStatusMessage: ReactElement

	switch (serverPingQuery.data) {
		case SERVER_STATUS.LOADING:
			serverIconClassName = `${classNames["flicker-animation"]} fill-gray-50`
			serverStatusMessage = <p>Checking for server response...</p>
			break
		case SERVER_STATUS.ONLINE:
			serverIconClassName = "fill-green-500"
			serverStatusMessage = <p>Server Online.</p>
			break
		case SERVER_STATUS.OFFLINE:
			serverIconClassName = "fill-destructive"
			serverStatusMessage = (
				<p>
					Server is unresponsive.{" "}
					<Button
						variant="link"
						className="p-0 m-0 h-fit"
						type="button"
						onClick={() => refreshServerStatus(queryClient)}
					>
						Retry Connection
					</Button>
				</p>
			)
			break
		default:
			serverIconClassName = "fill-destructive"
			serverStatusMessage = <p>Unknown error occured.</p>
			break
	}

	return (
		<div className="w-full flex gap-4 mt-2 items-center justify-center">
			<Circle width={15} className={serverIconClassName} />
			<span className="text-sm">{serverStatusMessage}</span>
		</div>
	)
}

function LedgerSelectorPage(props: DocumentPageProps) {
	const { setCurPage } = props.curPageState
	const { setLedger } = props.ledgerState

	const ledgersQuery = useLedgersQuery()
	const serverPingQuery = useServerPingQuery()

	const isItemButtonEnabled =
		props.isFetchingReport ||
		serverPingQuery.isFetching ||
		serverPingQuery.data !== SERVER_STATUS.ONLINE

	const renderLedgerList = () => {
		const result: JSX.Element[] = []
		if (!ledgersQuery.isFetched && ledgersQuery.isFetching) {
			return (
				<div className="h-full w-full flex justify-center items-center">
					<ReloadIcon className="ml-2 h-4 w-4 animate-spin" />
				</div>
			)
		}

		if (!ledgersQuery.data) {
			return undefined
		}

		for (let i = 0; i < ledgersQuery.data.length; i++) {
			const ledger: Ledger = ledgersQuery.data[ledgersQuery.data.length - 1 - i]

			result.push(
				<li className="px-1" key={ledger.id}>
					<Button
						type="button"
						disabled={isItemButtonEnabled}
						onClick={(e) => {
							e.preventDefault()
							setLedger(ledger)
							setCurPage((c) => c + 1)
						}}
						className="p-4 w-full h-full flex justify-between items-center"
						variant="ghost"
					>
						<span>{ledger.name}</span>
						<ChevronRight className="mt-0 w-4 h-4" />
					</Button>
				</li>
			)
		}

		return result
	}

	return (
		<>
			<DialogHeader className="space-y-0">
				<div className="w-full relative space-y-0 sm:text-center">
					<DialogTitle asChild>
						<h2 className="w-2/3 mx-auto sm:w-full leading-6">
							Select a ledger
						</h2>
					</DialogTitle>
					<DialogClose className="absolute block right-0 top-1/2 translate-y-[-50%]">
						<X className="w-4 h-4" />
					</DialogClose>
				</div>
				<DialogDescription>
					<VisuallyHidden>
						Select a ledger to download a report from.
					</VisuallyHidden>
					<ServerStatusLabel />
				</DialogDescription>
			</DialogHeader>
			<ul className="max-h-full overflow-y-auto [&>:not(:first-child)]:mt-1.5">
				{renderLedgerList()}
			</ul>
		</>
	)
}

function MonthSelectorPage(props: DocumentPageProps) {
	const { toast } = useToast()

	const { ledger } = props.ledgerState
	const { setCurPage } = props.curPageState
	const [isPendingIndex, setIsPendingIndex] = useState(-1)

	const setOpen = useGlobalStore((state) => state.setOpen)
	const setData = useGlobalStore((state) => state.setData)
	const setOnSubmitSuccess = useGlobalStore((state) => state.setOnSubmitSuccess)

	const queryClient = useQueryClient()
	const settingsQuery = useSettingsQuery()
	const monthGroupQuery = useMonthGroupQuery(ledger?.id)
	const serverPingQuery = useServerPingQuery()

	const isItemButtonEnabled =
		props.isFetchingReport ||
		serverPingQuery.isFetching ||
		serverPingQuery.data !== SERVER_STATUS.ONLINE

	const renderDownloadList = () => {
		const result: JSX.Element[] = []
		if (
			!monthGroupQuery.data ||
			!monthGroupQuery.isFetched ||
			monthGroupQuery.isFetching ||
			settingsQuery.isFetching
		) {
			return (
				<div className="w-full h-full flex justify-center items-center">
					<ReloadIcon className="ml-2 h-4 w-4 animate-spin" />
				</div>
			)
		}

		if (!monthGroupQuery?.data || monthGroupQuery.data.length < 1) {
			return (
				<div className="w-full h-full flex justify-center items-center flex-col text-sm text-center">
					<p className="w-5/6 mb-4">
						No data found for this ledger. Please add some transaction records
						to download its reports.
					</p>
					<DialogClose
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
							setOpen(true)
						}}
					>
						<Button>Add an entry</Button>
					</DialogClose>
				</div>
			)
		}

		for (let i = 0; i < monthGroupQuery.data.length; i++) {
			const value = monthGroupQuery.data[i]

			result.push(
				<li className="px-1" key={`${value.month} ${value.year}`}>
					<Button
						type="button"
						disabled={isItemButtonEnabled}
						onClick={async (e) => {
							e.preventDefault()
							if (value.month === null || value.year === null) {
								toast({
									description: "No month/year provided.",
									duration: SHORT_TOAST_DURATION,
									variant: "destructive"
								})
								return
							}

							setIsPendingIndex(i)
							const { dismiss } = toast({
								description: "Fetching document. Please wait...",
								duration: Infinity
							})

							// Using fetch to handle redirection on iOS
							try {
								const fileBlob = await props.fetchFn(value)
								dismiss()

								const url = window.URL.createObjectURL(fileBlob)
								setTimeout(() => window.URL.revokeObjectURL(url), 1000)

								window.location.assign(url)
							} catch (error: unknown) {
								let errMessage = "Unknown error occured"

								console.log(error)
								if (error instanceof CancelledError) {
									errMessage = "Operation cancelled by user."
								} else if (error instanceof Error) {
									errMessage = error.message
								}

								refreshServerStatus(queryClient)
								toast({
									description: errMessage,
									variant: "destructive",
									duration: SHORT_TOAST_DURATION
								})
							}

							setIsPendingIndex(-1)
						}}
						className="p-4 w-full h-full flex justify-between items-center"
						variant="ghost"
					>
						<span>
							{MONTHS[(value.month as number) - 1]} {value.year}
						</span>
						{isPendingIndex === -1 || isPendingIndex !== i ? (
							<DownloadIcon className="mt-0" />
						) : (
							<ReloadIcon className="ml-2 h-4 w-4 animate-spin" />
						)}
					</Button>
				</li>
			)
		}

		return result
	}

	return (
		<>
			<DialogHeader className="space-y-0">
				<div className="w-full relative space-y-0 sm:text-center">
					<DialogTitle asChild>
						<h2 className="w-2/3 mx-auto sm:w-full leading-6">
							Select a month to download a report
						</h2>
					</DialogTitle>
					<button
						className="absolute block left-0 top-1/2 translate-y-[-50%]"
						onClick={() => {
							setCurPage((c) => c - 1)
						}}
					>
						<ChevronLeft className="w-4 h-4" />
					</button>
					<DialogClose className="absolute block right-0 top-1/2 translate-y-[-50%]">
						<X className="w-4 h-4" />
					</DialogClose>
				</div>
				<DialogDescription>
					<VisuallyHidden>
						Select a month to download the report PDF for that month
					</VisuallyHidden>
					<ServerStatusLabel />
				</DialogDescription>
			</DialogHeader>
			<ul className="max-h-full relative overflow-y-auto [&>:not(:first-child)]:mt-1.5">
				{renderDownloadList()}
			</ul>
		</>
	)
}

export default function Documents() {
	const [curPage, setCurPage] = useState(0)
	const [ledger, setLedger] = useState<Ledger | undefined>(undefined)

	const queryClient = useQueryClient()
	const userQuery = useUserQuery()
	const serverPingQuery = useServerPingQuery()
	const isFetchingReport = useIsFetching({ queryKey: DOCUMENT_QKEY })

	const fetchReport = (monthGroup: MonthGroup) => {
		return queryClient.fetchQuery({
			queryKey: DOCUMENT_QKEY,
			queryFn: async () => {
				const locale =
					navigator.languages.find((value) => {
						const [region, language] = value.split("-")
						return region !== undefined && language !== undefined
					}) ?? "en-us"

				const response = await fetch("/api/documents", {
					method: "POST",
					body: JSON.stringify({
						month: monthGroup.month,
						year: monthGroup.year,
						locale: locale,
						ledger_id: ledger?.id as number
					})
				})

				if (!response.ok) {
					throw new FetchError(
						"Unable to connect to the server. Please try again later."
					)
				}

				const fileBlob: Blob = await response.blob()
				return fileBlob
			}
		})
	}

	const renderPage = () => {
		const pages = [LedgerSelectorPage, MonthSelectorPage]
		const CurrentPage = pages[curPage]

		if (CurrentPage === undefined) {
			return undefined
		}
		return (
			<CurrentPage
				isFetchingReport={isFetchingReport > 0}
				curPageState={{ curPage, setCurPage }}
				ledgerState={{ ledger, setLedger }}
				fetchFn={fetchReport}
			/>
		)
	}

	return (
		<Dialog
			onOpenChange={(open) => {
				if (open) return
				queryClient.cancelQueries({ queryKey: DOCUMENT_QKEY })
			}}
		>
			<div className="mt-8">
				<div>
					<Label>Documents</Label>
					<p className="text-sm text-muted-foreground">
						Download a PDF document detailing the transactions of a given month.
					</p>
				</div>
				<DialogTrigger asChild>
					<Button
						disabled={userQuery.isLoading}
						className="mt-4"
						onClick={() => {
							if (serverPingQuery.data !== SERVER_STATUS.ONLINE) {
								queryClient.invalidateQueries({ queryKey: SERVER_PING_QKEY })
							}
						}}
					>
						Download a report
					</Button>
				</DialogTrigger>
			</div>
			<DialogContent
				hideCloseButton
				onOpenAutoFocus={() => setCurPage(0)}
				className="h-dvh grid-rows-[auto_1fr] max-w-none duration-0 border-0 sm:border sm:h-5/6 sm:min-h-[460px] sm:max-w-lg"
			>
				{renderPage()}
			</DialogContent>
		</Dialog>
	)
}
