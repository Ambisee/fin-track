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
import { MONTHS, SHORT_TOAST_DURATION } from "@/lib/constants"
import {
	useLedgersQuery,
	useMonthGroupQuery,
	useSettingsQuery,
	useUserQuery
} from "@/lib/hooks"
import useGlobalStore from "@/lib/store"
import { getEntryQueryKey, getStatisticsQueryKey } from "@/lib/utils"
import { Ledger } from "@/types/supabase"
import { DownloadIcon, ReloadIcon } from "@radix-ui/react-icons"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { useQueryClient } from "@tanstack/react-query"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Dispatch, SetStateAction, useState, type JSX } from "react"

interface DocumentPageProps {
	curPageState: {
		curPage: number
		setCurPage: Dispatch<SetStateAction<number>>
	}
	ledgerState: {
		ledger: Ledger | undefined
		setLedger: Dispatch<SetStateAction<Ledger | undefined>>
	}
}

function LedgerSelectorPage(props: DocumentPageProps) {
	const { setCurPage } = props.curPageState
	const { setLedger } = props.ledgerState
	const ledgersQuery = useLedgersQuery()

	const renderLedgerList = () => {
		const result: JSX.Element[] = []
		if (!ledgersQuery.isFetched && ledgersQuery.isFetching) {
			return (
				<div className="h-full w-full flex justify-center items-center">
					<ReloadIcon className="ml-2 h-4 w-4 animate-spin" />
				</div>
			)
		}

		if (!ledgersQuery.data?.data) {
			return undefined
		}

		for (let i = 0; i < ledgersQuery.data.data.length; i++) {
			const ledger: Ledger =
				ledgersQuery.data.data[ledgersQuery.data.data.length - 1 - i]

			result.push(
				<li className="px-1" key={ledger.id}>
					<Button
						type="button"
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

	const setData = useGlobalStore((state) => state.setData)
	const setOnSubmitSuccess = useGlobalStore((state) => state.setOnSubmitSuccess)

	const queryClient = useQueryClient()
	const settingsQuery = useSettingsQuery()
	const monthGroupQuery = useMonthGroupQuery(ledger?.id)

	const renderDownloadList = () => {
		const result: JSX.Element[] = []
		if (
			!monthGroupQuery.isFetched ||
			!monthGroupQuery.data?.data ||
			monthGroupQuery.isFetching ||
			settingsQuery.isFetching
		) {
			return (
				<div className="w-full h-full flex justify-center items-center">
					<ReloadIcon className="ml-2 h-4 w-4 animate-spin" />
				</div>
			)
		}

		if (
			!!settingsQuery.data?.data?.current_ledger &&
			(!monthGroupQuery?.data?.data || monthGroupQuery.data.data.length < 1)
		) {
			return (
				<div className="w-full h-full flex justify-center items-center flex-col text-sm text-center">
					<p className="w-5/6 mb-4">
						No data found for this ledger. Please add some transaction records
						to download its reports.
					</p>
					<DialogTrigger
						asChild
						onClick={() => {
							setData(undefined)
							setOnSubmitSuccess((data) => {
								queryClient.invalidateQueries({
									queryKey: getEntryQueryKey(data.ledger, new Date(data.date))
								})
								queryClient.invalidateQueries({
									queryKey: getStatisticsQueryKey(
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

		for (let i = 0; i < monthGroupQuery.data.data.length; i++) {
			const value = monthGroupQuery.data.data[i]

			result.push(
				<li className="px-1" key={`${value.month} ${value.year}`}>
					<Button
						type="button"
						disabled={isPendingIndex !== -1}
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
								const response = await fetch("/api/documents", {
									method: "POST",
									body: JSON.stringify({
										month: value.month,
										year: value.year,
										locale: navigator.language,
										ledger_id: ledger?.id as number
									})
								})

								dismiss()
								if (!response.ok) {
									throw Error(
										"Unable to connect to the server. Please try again later."
									)
								}

								const fileBlob: Blob = await response.blob()
								const url = window.URL.createObjectURL(fileBlob)
								setTimeout(() => window.URL.revokeObjectURL(url), 1000)

								window.location.assign(url)
							} catch (error: any) {
								toast({
									description: error.message,
									variant: "destructive"
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

	const userQuery = useUserQuery()

	const renderPage = () => {
		const pages = [LedgerSelectorPage, MonthSelectorPage]
		const CurrentPage = pages[curPage]

		if (CurrentPage === undefined) {
			return undefined
		}
		return (
			<CurrentPage
				curPageState={{ curPage, setCurPage }}
				ledgerState={{ ledger, setLedger }}
			/>
		)
	}

	return (
		<Dialog>
			<div className="mt-8">
				<div>
					<Label>Documents</Label>
					<p className="text-sm text-muted-foreground">
						Download a PDF document detailing the transactions of a given month.
					</p>
				</div>
				<DialogTrigger asChild>
					<Button disabled={userQuery.isLoading} className="mt-4">
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
