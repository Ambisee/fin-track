"use client"

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from "@/components/ui/card"
import { QueryHelper } from "@/lib/helper/QueryHelper"
import { useAmountFormatter, useSettingsQuery } from "@/lib/hooks"
import useGlobalStore from "@/lib/store"
import { supabaseClient } from "@/lib/supabase"
import { isNonNullable } from "@/lib/utils"
import { Entry } from "@/types/supabase"
import { AlertDialogTrigger } from "@radix-ui/react-alert-dialog"
import { DialogTrigger } from "@radix-ui/react-dialog"
import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from "../ui/alert-dialog"
import { Button } from "../ui/button"
import { ScrollArea } from "../ui/scroll-area"
import { Skeleton } from "../ui/skeleton"
import { toast } from "sonner"

interface EntryListItemProps {
	data: Entry
	expand?: boolean
	showButtons?: boolean
	onEdit?: (data: Entry) => void
	onExpand?: (value: boolean) => void
}

function formatListItemDate(date: Date) {
	const formatter = Intl.DateTimeFormat(undefined, { dateStyle: "medium" })
	return formatter.format(date)
}

function NoteText(props: { className?: string; text: string }) {
	if (props.text === "") {
		return <p className="text-muted">No notes here.</p>
	}

	const textWithBreaks = props.text.split("\n").map((text, index) => (
		<p key={index}>
			{text}
			<br />
		</p>
	))

	return <ScrollArea className={props.className}>{textWithBreaks}</ScrollArea>
}

export default function EntryListItem({
	showButtons = true,
	...props
}: EntryListItemProps) {
	const [internalOpen, setInternalOpen] = useState(false)

	const queryClient = useQueryClient()
	const [supabase] = useState(supabaseClient())

	const setOpen = useGlobalStore((state) => state.setOpen)
	const setData = useGlobalStore((state) => state.setData)
	const setOnSubmitSuccess = useGlobalStore((state) => state.setOnSubmitSuccess)

	const userSettingsQuery = useSettingsQuery()
	const deleteMutation = useMutation({
		mutationFn: (id: number) => {
			return Promise.resolve(supabase.from("entry").delete().eq("id", id))
		}
	})

	const formatAmount = useAmountFormatter()
	const isItemExpanded = props.expand ?? internalOpen

	return (
		<Card
			data-open={isItemExpanded}
			data-is-positive={props.data.is_positive}
			className="data-[open='true']:max-h-none 
                    data-[open='false']:max-h-[100px] overflow-hidden group"
		>
			<CardHeader className="p-0 h-[100px]">
				<button
					type="button"
					className="h-full w-full p-4 text-left focus:outline-hidden"
					onClick={() => {
						const curOpen = props.expand ?? internalOpen
						setInternalOpen(!curOpen)
						props.onExpand?.(!curOpen)
					}}
				>
					<div className="flex justify-between items-center w-inherit">
						<div className="grid max-w-[calc(50%-0.25rem)] text-entry-item">
							<CardTitle className="text-lg whitespace-nowrap overflow-hidden text-ellipsis">
								{props.data.category}
							</CardTitle>
							<CardDescription>
								{formatListItemDate(new Date(props.data.date))}
							</CardDescription>
						</div>
						<div className="flex gap-2 items-center">
							{userSettingsQuery.isLoading ? (
								<Skeleton className="w-20 h-6" />
							) : (
								<div className="whitespace-nowrap">
									<p className="w-full align-baseline text-entry-item">
										{props.data.is_positive ? "+ " : "- "}
										{formatAmount(props.data.amount)}
									</p>
								</div>
							)}
							{internalOpen ? (
								<ChevronUpIcon width={25} height={25} />
							) : (
								<ChevronDownIcon width={25} height={25} />
							)}
						</div>
					</div>
				</button>
			</CardHeader>
			<CardContent className="px-4">
				<NoteText
					className="text-base text-secondary-foreground font-light max-h-52 overflow-y-auto"
					text={props.data.note ?? ""}
				/>
				{showButtons && (
					<div className="flex mt-4 gap-4">
						<>
							<DialogTrigger asChild>
								<Button
									className="min-w-24"
									type="button"
									onClick={() => {
										setData(props.data)
										setOnSubmitSuccess((data, oldData) => {
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

											// Update the query data corresponding to the data's old ledger and date
											const oldDataExists = isNonNullable(oldData)
											const similarLedgerAndDate =
												data.ledger === oldData?.ledger &&
												data.date === oldData?.date

											if (!oldDataExists || similarLedgerAndDate) {
												setData(data)
												return
											}

											queryClient.invalidateQueries({
												queryKey: QueryHelper.getEntryQueryKey(
													oldData.ledger,
													new Date(oldData.date)
												)
											})
											queryClient.invalidateQueries({
												queryKey: QueryHelper.getStatisticQueryKey(
													oldData.ledger,
													new Date(oldData.date)
												)
											})

											setOpen(false)
										})
									}}
									onFocus={() => setInternalOpen(true)}
									variant="default"
								>
									Edit
								</Button>
							</DialogTrigger>
						</>
						<AlertDialog>
							<>
								<AlertDialogTrigger asChild>
									<Button
										className="min-w-24"
										type="button"
										onFocus={() => setInternalOpen(true)}
										variant="destructive"
									>
										Delete
									</Button>
								</AlertDialogTrigger>
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
														const toastId = toast.loading("Loading...")

														if (data.error !== null) {
															toast.dismiss(toastId)
															toast.error(data.error.message)
															return
														}

														toast.dismiss(toastId)
														toast.info("Successfully removed the transaction", {
															duration: 500
														})

														queryClient.invalidateQueries({
															queryKey: QueryHelper.getEntryQueryKey(
																props.data.ledger,
																new Date(props.data.date)
															)
														})
														queryClient.invalidateQueries({
															queryKey: QueryHelper.getStatisticQueryKey(
																props.data.ledger,
																new Date(props.data.date)
															)
														})
													}
												})
											}
										>
											Delete
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</>
						</AlertDialog>
					</div>
				)}
			</CardContent>
		</Card>
	)
}
