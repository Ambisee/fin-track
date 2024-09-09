"use client"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { ENTRY_QKEY } from "@/lib/constants"
import { useSettingsQuery } from "@/lib/hooks"
import { sbBrowser } from "@/lib/supabase"
import { getElementFromNode } from "@/lib/utils"
import { Entry } from "@/types/supabase"
import { DialogTrigger } from "@radix-ui/react-dialog"
import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Fragment, useState } from "react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "../ui/alert-dialog"
import { Button } from "../ui/button"
import { Dialog } from "../ui/dialog"
import { ScrollArea } from "../ui/scroll-area"
import { Skeleton } from "../ui/skeleton"
import { toast, useToast } from "../ui/use-toast"
import EntryForm from "./EntryForm"

interface EntryListItemProps {
	data: Entry
	onEdit?: (data: Entry) => void
}

function NoteText(props: { className?: string; text: string }) {
	const textWithBreaks = props.text.split("\n").map((text, index) => (
		<Fragment key={index}>
			{text}
			<br />
		</Fragment>
	))

	return <ScrollArea className={props.className}>{textWithBreaks}</ScrollArea>
}

function DeletePopover(props: Pick<EntryListItemProps, "data">) {
	const { toast } = useToast()
	const queryClient = useQueryClient()
	const deleteMutation = useMutation({
		mutationFn: (id: number) => {
			return Promise.resolve(sbBrowser.from("entry").delete().eq("id", id))
		}
	})

	return (
		<AlertDialogContent>
			<AlertDialogHeader>
				<AlertDialogTitle>Confirm Action</AlertDialogTitle>
				<AlertDialogDescription>
					Are you sure you want to delete this transaction?
				</AlertDialogDescription>
			</AlertDialogHeader>
			<AlertDialogFooter>
				<AlertDialogCancel>Cancel</AlertDialogCancel>
				<AlertDialogAction
					variant="destructive"
					onClick={() =>
						deleteMutation.mutate(props.data.id, {
							onSuccess: (data) => {
								toast({
									description: "Loading..."
								})

								if (data.error !== null) {
									toast({
										description: data.error.message
									})
									return
								}

								toast({
									description: "Successfully removed the transaction",
									duration: 500
								})

								queryClient.invalidateQueries({ queryKey: ENTRY_QKEY })
							}
						})
					}
				>
					Delete
				</AlertDialogAction>
			</AlertDialogFooter>
		</AlertDialogContent>
	)
}

function PopoverRoot(props: {
	children: JSX.Element
	open?: boolean
	onOpenChange?: (open: boolean) => void | undefined
	isAlert?: boolean
}) {
	if (props.isAlert) {
		return (
			<AlertDialog open={props.open} onOpenChange={props.onOpenChange}>
				{props.children}
			</AlertDialog>
		)
	}

	return (
		<Dialog open={props.open} onOpenChange={props.onOpenChange}>
			{props.children}
		</Dialog>
	)
}

function PopoverTrigger(props: { children: JSX.Element; isAlert?: boolean }) {
	if (props.isAlert) {
		return <AlertDialogTrigger asChild>{props.children}</AlertDialogTrigger>
	}
	return <DialogTrigger asChild>{props.children}</DialogTrigger>
}

export default function EntryListItem(props: EntryListItemProps) {
	const queryClient = useQueryClient()
	const [isItemOpen, setIsItemOpen] = useState(false)
	const [isFormOpen, setIsFormOpen] = useState(false)

	const userSettingsQuery = useSettingsQuery()

	const formatAmount = (num?: number) => {
		const currency = userSettingsQuery?.data?.data?.currencies?.currency_name
		if (num === undefined || currency === undefined || currency === null) {
			return num
		}

		if (!Intl.supportedValuesOf("currency").includes(currency)) {
			return num.toFixed(2)
		}

		return new Intl.NumberFormat(navigator.language, {
			style: "currency",
			currency: currency,
			currencyDisplay: "narrowSymbol"
		}).format(num)
	}

	return (
		<AlertDialog>
			<>
				<Card
					data-open={isItemOpen}
					data-is-positive={props.data.amount_is_positive}
					className="data-[open='true']:max-h-none 
                    data-[open='false']:max-h-[100px] overflow-hidden group"
				>
					<CardHeader className="p-0 h-[100px]">
						<button
							type="button"
							className="h-full w-full p-4 text-left focus:bg-background focus:outline-none"
							onClick={() => {
								setIsItemOpen((c) => !c)
							}}
						>
							<div className="flex justify-between items-center w-inherit">
								<div className="grid max-w-[calc(50%-0.25rem)]">
									<CardTitle className="text-lg whitespace-nowrap overflow-hidden overflow-ellipsis group-data-[is-positive='true']:text-green-600 group-data-[is-positive='false']:text-primary">
										{props.data.title}
									</CardTitle>
									<CardDescription className="group-data-[is-positive='true']:text-green-600 group-data-[is-positive='false']:text-primary">
										{props.data.date.toString()}
									</CardDescription>
								</div>
								<div className="flex gap-2">
									{userSettingsQuery.isLoading ? (
										<Skeleton className="w-20 h-6" />
									) : (
										<div className="max-w-[120px] whitespace-nowrap overflow-hidden md:max-w-none">
											<p className="group-data-[is-positive='true']:text-green-600 group-data-[is-positive='false']:text-primary w-full">
												{props.data.amount_is_positive ? "+ " : "- "}
												{formatAmount(props.data.amount)}
											</p>
										</div>
									)}
									{isItemOpen ? (
										<ChevronUpIcon width={25} height={25} />
									) : (
										<ChevronDownIcon width={25} height={25} />
									)}
								</div>
							</div>
						</button>
					</CardHeader>
					<CardContent className="px-4">
						{props.data.note !== "" && props.data.note !== null && (
							<NoteText
								className="text-base text-secondary-foreground font-light max-h-52 mb-4 overflow-y-auto"
								text={props.data.note}
							/>
						)}
						<div className="flex gap-4">
							<PopoverRoot open={isFormOpen} onOpenChange={setIsFormOpen}>
								<>
									<PopoverTrigger>
										<Button
											className="min-w-24"
											type="button"
											onFocus={() => setIsItemOpen(true)}
											variant="default"
										>
											Edit
										</Button>
									</PopoverTrigger>
									<EntryForm
										data={props.data}
										onSubmitSuccess={(data) => {
											if (data.error !== null) {
												toast({
													description: data.error.message,
													variant: "destructive"
												})
												return
											}

											const observer = new MutationObserver((mutationsList) => {
												for (const mutation of mutationsList) {
													if (mutation.removedNodes.length > 0) {
														const element = getElementFromNode(
															mutation.removedNodes[0]
														)
														if (
															element !== null &&
															(element.getAttribute("vaul-drawer") !== null ||
																element?.getAttribute("role") === "dialog")
														) {
															queryClient.invalidateQueries({
																queryKey: ENTRY_QKEY
															})
															observer.disconnect()
														}
													}
												}
											})

											observer.observe(document.body, { childList: true })
											setIsFormOpen(false)
										}}
									/>
								</>
							</PopoverRoot>
							<PopoverRoot isAlert={true}>
								<>
									<PopoverTrigger isAlert={true}>
										<Button
											className="min-w-24"
											type="button"
											onFocus={() => setIsItemOpen(true)}
											variant="destructive"
										>
											Delete
										</Button>
									</PopoverTrigger>
									<DeletePopover data={props.data} />
								</>
							</PopoverRoot>
						</div>
					</CardContent>
				</Card>
			</>
		</AlertDialog>
	)
}
