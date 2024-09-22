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
import { Dialog } from "../ui/dialog"
import { ScrollArea } from "../ui/scroll-area"
import { Skeleton } from "../ui/skeleton"
import { useToast } from "../ui/use-toast"
import EntryForm from "./EntryForm/EntryForm"
import useGlobalStore from "@/lib/store"

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

export default function EntryListItem(props: EntryListItemProps) {
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

	const formatAmount = (num?: number) => {
		const currency = userSettingsQuery?.data?.data?.currency?.currency_name
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
						<div className="grid max-w-[calc(50%-0.25rem)]">
							<CardTitle className="text-lg whitespace-nowrap overflow-hidden overflow-ellipsis group-data-[is-positive='true']:text-green-600 group-data-[is-positive='false']:text-primary">
								{props.data.category?.name}
							</CardTitle>
							<CardDescription className="group-data-[is-positive='true']:text-green-600 group-data-[is-positive='false']:text-primary">
								{props.data.date.toString()}
							</CardDescription>
						</div>
						<div className="flex gap-2">
							{userSettingsQuery.isLoading ? (
								<Skeleton className="w-20 h-6" />
							) : (
								<div className="whitespace-nowrap">
									<p className="group-data-[is-positive='true']:text-green-600 group-data-[is-positive='false']:text-primary w-full">
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
				{props.data.note !== "" && props.data.note !== null && (
					<NoteText
						className="text-base text-secondary-foreground font-light max-h-52 mb-4 overflow-y-auto"
						text={props.data.note}
					/>
				)}
				<div className="flex gap-4">
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
														description: "Successfully removed the transaction",
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
			</CardContent>
		</Card>
	)
}
