"use client"

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from "@/components/ui/card"
import { ENTRY_QKEY } from "@/lib/constants"
import { useAmountFormatter, useSettingsQuery } from "@/lib/hooks"
import { sbBrowser } from "@/lib/supabase"
import { Entry } from "@/types/supabase"
import { AlertDialogTrigger } from "@radix-ui/react-alert-dialog"
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
	AlertDialogTitle
} from "../ui/alert-dialog"
import { Button } from "../ui/button"
import { ScrollArea } from "../ui/scroll-area"
import { Skeleton } from "../ui/skeleton"
import { useToast } from "../ui/use-toast"
import useGlobalStore from "@/lib/store"

interface EntryListItemProps {
	data: Entry
	onEdit?: (data: Entry) => void
	showButtons?: boolean
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
	const [isItemOpen, setIsItemOpen] = useState(false)

	const { toast } = useToast()
	const queryClient = useQueryClient()

	const setOpen = useGlobalStore((state) => state.setOpen)
	const setData = useGlobalStore((state) => state.setData)
	const setOnSubmitSuccess = useGlobalStore((state) => state.setOnSubmitSuccess)

	const userSettingsQuery = useSettingsQuery()
	const deleteMutation = useMutation({
		mutationFn: (id: number) => {
			return Promise.resolve(sbBrowser.from("entry").delete().eq("id", id))
		}
	})

	const formatAmount = useAmountFormatter()

	return (
		<Card
			data-open={isItemOpen}
			data-is-positive={props.data.is_positive}
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
						<div className="grid max-w-[calc(50%-0.25rem)] text-entry-item">
							<CardTitle className="text-lg whitespace-nowrap overflow-hidden overflow-ellipsis">
								{props.data.category}
							</CardTitle>
							<CardDescription>{props.data.date}</CardDescription>
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
										setOnSubmitSuccess((data) => {
											if (data.error !== null) {
												toast({
													description: data.error.message,
													variant: "destructive"
												})
												return
											}

											queryClient.invalidateQueries({ queryKey: ENTRY_QKEY })
											setOpen(false)
										})
									}}
									onFocus={() => setIsItemOpen(true)}
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
										onFocus={() => setIsItemOpen(true)}
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
															description:
																"Successfully removed the transaction",
															duration: 500
														})

														queryClient.invalidateQueries({
															queryKey: ENTRY_QKEY
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
