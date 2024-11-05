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
import { MONTHS } from "@/lib/constants"
import { useUserQuery } from "@/lib/hooks"
import { DownloadIcon, ReloadIcon } from "@radix-ui/react-icons"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { X } from "lucide-react"
import { useContext, useState } from "react"
import { DashboardContext } from "../../../layout"

export default function Documents() {
	const { toast } = useToast()
	const { dataGroups } = useContext(DashboardContext)
	const [isPendingIndex, setIsPendingIndex] = useState(-1)

	const userQuery = useUserQuery()

	const renderDownloadList = () => {
		const result = []

		for (let i = dataGroups.length - 1; i >= 0; i--) {
			const value = dataGroups[i]

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
									month: MONTHS.indexOf(value.month) + 1,
									year: value.year
								})
							})
								.then((resp) => {
									dismiss()
									return resp.blob()
								})
								.catch((err) => {
									update({
										id: id,
										description: err,
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
							{value.month} {value.year}
						</span>
						{isPendingIndex === -1 || isPendingIndex !== i ? (
							<DownloadIcon className="m-0" />
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
				className="h-dvh grid-rows-[auto_1fr] max-w-none duration-0 border-0 sm:border sm:h-5/6 sm:min-h-[460px] sm:max-w-lg"
			>
				<DialogHeader className="space-y-0">
					<div className="w-full relative space-y-0 sm:text-center">
						<DialogTitle asChild>
							<h1 className="w-2/3 mx-auto sm:w-full leading-6">
								Select a month to download a report PDF
							</h1>
						</DialogTitle>
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
				<ul className="max-h-full overflow-y-auto [&_:not(:first-child)]:mt-1.5">
					{renderDownloadList()}
				</ul>
			</DialogContent>
		</Dialog>
	)
}
