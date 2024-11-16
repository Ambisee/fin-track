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
import DialogPagesProvider, {
	useDialogPages
} from "@/components/user/DialogPagesProvider"
import { MONTHS } from "@/lib/constants"
import {
	useLedgersQuery,
	useMonthGroupQuery,
	useSettingsQuery,
	useUserQuery
} from "@/lib/hooks"
import { DownloadIcon, ReloadIcon } from "@radix-ui/react-icons"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { useState } from "react"
import { useFormContext } from "react-hook-form"
import LedgerStoreProvider, {
	useLedgerStore
} from "../GeneralSection/LedgerProvider"

function LedgerSelectorPage() {
	const { toast } = useToast()
	const form = useFormContext()
	const ledgersQuery = useLedgersQuery()
	const { setCurPage } = useDialogPages()
	const { setLedger: setLedgerToEdit } = useLedgerStore()

	const renderLedgerList = () => {
		const result: JSX.Element[] = []
		if (!ledgersQuery.data?.data) {
			return undefined
		}

		for (let i = 0; i < ledgersQuery.data.data.length; i++) {
			const ledger = ledgersQuery.data.data[i]

			result.push(
				<li className="px-1" key={ledger.id}>
					<Button
						type="button"
						onClick={(e) => {
							e.preventDefault()
							setLedgerToEdit(ledger)
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
						<h1 className="w-2/3 mx-auto sm:w-full leading-6">
							Select a ledger
						</h1>
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

function MonthSelectorPage() {
	const { toast } = useToast()
	const [isPendingIndex, setIsPendingIndex] = useState(-1)
	const { ledger: ledgerToEdit } = useLedgerStore()
	const { setCurPage } = useDialogPages()

	const monthGroupQuery = useMonthGroupQuery(ledgerToEdit?.id)

	const renderDownloadList = () => {
		const result: JSX.Element[] = []
		if (!monthGroupQuery?.data?.data) {
			return undefined
		}

		for (let i = 0; i < monthGroupQuery.data.data.length; i++) {
			const value = monthGroupQuery.data.data[i]

			result.push(
				<li className="px-1" key={`${value.month} ${value.year}`}>
					<Button
						type="button"
						disabled={isPendingIndex !== -1}
						onClick={(e) => {
							e.preventDefault()

							setIsPendingIndex(i)
							const { dismiss, id, update } = toast({
								description: "Fetching document. Please wait...",
								duration: Infinity
							})

							// Using fetch to handle redirection on iOS
							fetch("/api/documents", {
								method: "POST",
								body: JSON.stringify({
                                    month: value.month,
									year: value.year,
									locale: navigator.language,
									ledger_id: ledgerToEdit?.id as number
								})
							})
								.then((resp) => {
									dismiss()
									if (!resp.ok) {
										throw Error(
											"Unable to retrieve the report document. Please try again later"
										)
									}

									return resp.blob()
								})
								.catch((err: Error) => {
									toast({
										description: err.message,
										variant: "destructive"
									})
									return undefined
								})
								.then((value) => {
									if (value === undefined) {
										return
									}

									const url = window.URL.createObjectURL(value)
									setTimeout(() => window.URL.revokeObjectURL(url), 1000)

									window.location.assign(url)
								})
								.finally(() => {
									setIsPendingIndex(-1)
								})
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
						<h1 className="w-2/3 mx-auto sm:w-full leading-6">
							Select a month to download a report
						</h1>
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
			<ul className="max-h-full overflow-y-auto [&>:not(:first-child)]:mt-1.5">
				{renderDownloadList()}
			</ul>
		</>
	)
}

function DocumentsContent() {
	const userQuery = useUserQuery()
	const settingsQuery = useSettingsQuery()
	const { curPage, setCurPage } = useDialogPages()

	const renderPage = () => {
		const pages = [LedgerSelectorPage, MonthSelectorPage]
		const CurrentPage = pages[curPage]

		if (CurrentPage === undefined) {
			return undefined
		}
		return <CurrentPage />
	}

	return (
		<>
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
		</>
	)
}

export default function Documents() {
	return (
		<DialogPagesProvider initialValues={{ curPage: 0 }}>
			<LedgerStoreProvider>
				<Dialog>
					<DocumentsContent />
				</Dialog>
			</LedgerStoreProvider>
		</DialogPagesProvider>
	)
}
