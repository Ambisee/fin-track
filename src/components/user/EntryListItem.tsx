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
import { DrawerEntryForm } from "./EntryForm"
import { sbBrowser } from "@/lib/supabase"
import { useToast } from "../ui/use-toast"
import { useMutation, useQueryClient } from "@tanstack/react-query"

interface EntryListItemProps {
	data: Entry
}
function EditForm(props: { data: Entry }) {
	return <DrawerEntryForm data={props.data} />
}

function DeleteDialog(props: { data: Entry }) {
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
				<AlertDialogTitle>Confirm Delete</AlertDialogTitle>
				<AlertDialogDescription>
					Are you sure you want to remove the transaction?
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

export default function EntryListItem(props: EntryListItemProps) {
	const [isOpen, setIsOpen] = useState(false)

	return (
		<AlertDialog>
			<Drawer shouldScaleBackground setBackgroundColorOnScale={false}>
				<Card
					data-open={isOpen}
					data-is-positive={props.data.amount_is_positive}
					className="data-[open='true']:max-h-96 
                    data-[open='false']:max-h-[100px] overflow-hidden group"
				>
					<CardHeader className="p-0 h-[100px]">
						<button
							type="button"
							className="h-full w-full p-4 text-left focus:bg-background focus:outline-none"
							onClick={() => {
								setIsOpen((c) => !c)
							}}
						>
							<div className="flex justify-between items-center w-inherit">
								<div className="grid max-w-[calc(50%-0.25rem)]">
									<CardTitle className="text-lg whitespace-nowrap overflow-hidden overflow-ellipsis">
										{props.data.title}
									</CardTitle>
									<CardDescription className="">
										{props.data.date.toString()}
									</CardDescription>
								</div>
								<div className="flex gap-2">
									<p className="group-data-[is-positive='true']:text-foreground group-data-[is-positive='false']:text-destructive">
										{props.data?.amount.toFixed(2)}
									</p>
									{isOpen ? (
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
							<DrawerTrigger asChild>
								<Button
									className="min-w-24"
									type="button"
									onFocus={() => setIsOpen(true)}
									variant="default"
								>
									Edit
								</Button>
							</DrawerTrigger>
							<AlertDialogTrigger asChild>
								<Button
									className="min-w-24"
									type="button"
									onFocus={() => setIsOpen(true)}
									variant="destructive"
								>
									Delete
								</Button>
							</AlertDialogTrigger>
						</div>
					</CardContent>
				</Card>

				{/* <EditForm data={props.data} /> */}
				<DrawerEntryForm data={props.data} />
				<DeleteDialog data={props.data} />
			</Drawer>
		</AlertDialog>
	)
}
