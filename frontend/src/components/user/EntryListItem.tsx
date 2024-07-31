"use client"

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from "@/components/ui/card"
import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons"
import { createContext, MouseEventHandler, useState } from "react"
import { Button } from "../ui/button"
import { Drawer, DrawerClose, DrawerTrigger } from "../ui/drawer"
import { Entry } from "@/types/supabase"
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogCancel,
	AlertDialogAction,
	AlertDialogFooter,
	AlertDialogTrigger
} from "../ui/alert-dialog"
import EntryForm from "./EntryForm"
import { sbBrowser } from "@/lib/supabase"
import { toast, useToast } from "../ui/use-toast"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { getElementFromNode } from "@/lib/utils"
import { Dialog } from "../ui/dialog"
import { DESKTOP_BREAKPOINT } from "@/lib/constants"
import { useMediaQuery } from "react-responsive"
import { DialogTrigger } from "@radix-ui/react-dialog"

interface EntryListItemProps {
	data: Entry
	onEdit?: (data: Entry) => void
}

function DeleteDialog(props: Pick<EntryListItemProps, "data">) {
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
									description: "Successfully removed the transaction"
								})

								queryClient.invalidateQueries({ queryKey: ["entryData"] })
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

function EntryFormWrapper(props: {
	children: JSX.Element
	open: boolean
	onOpenChange: (open: boolean) => void | undefined
}) {
	const isDesktop = useMediaQuery({
		minWidth: DESKTOP_BREAKPOINT
	})

	if (isDesktop) {
		return (
			<Dialog open={props.open} onOpenChange={props.onOpenChange}>
				{props.children}
			</Dialog>
		)
	}

	return (
		<Drawer
			open={props.open}
			onOpenChange={props.onOpenChange}
			shouldScaleBackground
			disablePreventScroll={true}
			setBackgroundColorOnScale={false}
		>
			{props.children}
		</Drawer>
	)
}

function EditButtonTrigger(props: { children: JSX.Element }) {
	const isDesktop = useMediaQuery({
		minWidth: DESKTOP_BREAKPOINT
	})

	return isDesktop ? (
		<DialogTrigger asChild>{props.children}</DialogTrigger>
	) : (
		<DrawerTrigger asChild>{props.children}</DrawerTrigger>
	)
}

export default function EntryListItem(props: EntryListItemProps) {
	const queryClient = useQueryClient()
	const [isItemOpen, setIsItemOpen] = useState(false)
	const [isFormOpen, setIsFormOpen] = useState(false)

	return (
		<AlertDialog>
			<EntryFormWrapper open={isFormOpen} onOpenChange={setIsFormOpen}>
				<>
					<Card
						data-open={isItemOpen}
						data-is-positive={props.data.amount_is_positive}
						className="data-[open='true']:max-h-96 
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
										<CardTitle className="text-lg whitespace-nowrap overflow-hidden overflow-ellipsis group-data-[is-positive='true']:text-green-500 group-data-[is-positive='false']:text-primary">
											{props.data.title}
										</CardTitle>
										<CardDescription className="group-data-[is-positive='true']:text-green-500 group-data-[is-positive='false']:text-primary">
											{props.data.date.toString()}
										</CardDescription>
									</div>
									<div className="flex gap-2">
										<p className="group-data-[is-positive='true']:text-green-500 group-data-[is-positive='false']:text-primary">
											{props.data.amount_is_positive ? "+ " : "- "}
											{props.data?.amount.toFixed(2)}
										</p>
										{isItemOpen ? (
											<ChevronUpIcon width={25} height={25} />
										) : (
											<ChevronDownIcon width={25} height={25} />
										)}
									</div>
								</div>
							</button>
						</CardHeader>
						<CardContent>
							<div className="pt-6 flex gap-4">
								<EditButtonTrigger>
									<Button
										className="min-w-24"
										type="button"
										onFocus={() => setIsItemOpen(true)}
										variant="default"
									>
										Edit
									</Button>
								</EditButtonTrigger>
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
							</div>
						</CardContent>
					</Card>
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
										const element = getElementFromNode(mutation.removedNodes[0])
										if (
											element !== null &&
											(element.getAttribute("vaul-drawer") !== null ||
												element?.getAttribute("role") === "dialog")
										) {
											queryClient.invalidateQueries({ queryKey: ["entryData"] })
											observer.disconnect()
										}
									}
								}
							})

							observer.observe(document.body, { childList: true })
							setIsFormOpen(false)
						}}
					/>
					<DeleteDialog data={props.data} />
				</>
			</EntryFormWrapper>
		</AlertDialog>
	)
}