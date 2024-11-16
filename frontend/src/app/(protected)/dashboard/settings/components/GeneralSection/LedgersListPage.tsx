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
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList
} from "@/components/ui/command"
import {
	DialogClose,
	DialogDescription,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useDialogPages } from "@/components/user/DialogPagesProvider"
import { ENTRY_QKEY, LEDGER_QKEY, USER_SETTINGS_QKEY } from "@/lib/constants"
import {
	useEntryDataQuery,
	useLedgersQuery,
	useSettingsQuery,
	useUserQuery
} from "@/lib/hooks"
import { sbBrowser } from "@/lib/supabase"
import { Ledger } from "@/types/supabase"
import {
	QueryObserver,
	useMutation,
	useQueryClient
} from "@tanstack/react-query"
import { ChevronLeft, PencilIcon, PlusIcon, Trash2Icon, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useLedgerToEdit } from "./LedgerProvider"

interface LedgersListPageProps {
	isEditMode?: boolean
	showBackButton?: boolean
}

export default function LedgersListPage(props: LedgersListPageProps) {
	const { toast } = useToast()
	const queryClient = useQueryClient()
	const closeRef = useRef<HTMLButtonElement>(null!)
	const { setCurPage } = useDialogPages()
	const { setLedgerToEdit } = useLedgerToEdit()

	const isEditMode = props.isEditMode ?? false
	const showBackButton = props.showBackButton ?? true

	const [ledgerToBeDelete, setLedgerToDelete] = useState<Ledger | undefined>(
		undefined
	)

	const userQuery = useUserQuery()
	const settingsQuery = useSettingsQuery()
	const ledgersQuery = useLedgersQuery()

	const selectLedgerMutation = useMutation({
		mutationKey: USER_SETTINGS_QKEY,
		mutationFn: async (data: { id: number }) => {
			if (userQuery.data?.data.user?.id === undefined) {
				return undefined
			}

			return sbBrowser
				.from("settings")
				.update({ current_ledger: data.id })
				.eq("user_id", userQuery.data?.data.user.id as string)
				.select("*, ledger (name)")
				.single()
		}
	})

	const deleteLedgerMutation = useMutation({
		mutationKey: LEDGER_QKEY,
		mutationFn: async (data: { id: number }) => {
			return sbBrowser.from("ledger").delete().eq("id", data.id).select()
		}
	})

	return (
		<div className="h-full grid gap-4 grid-rows-[auto_1fr]">
			<DialogHeader className="space-y-0 sm:text-center h-fit">
				<div className="relative">
					<DialogTitle className="leading-6" asChild>
						<h1 className="h-6 leading-6">
							{isEditMode
								? "Select a ledger to edit"
								: "Select a ledger to view"}
						</h1>
					</DialogTitle>
					{showBackButton && (
						<button
							className="absolute block left-0 top-1/2 translate-y-[-50%]"
							onClick={() => setCurPage((c) => c - 1)}
						>
							<ChevronLeft className="w-4 h-4" />
						</button>
					)}
					{isEditMode && (
						<button
							className="absolute block left-0 top-1/2 translate-y-[-50%]"
							onClick={() => setCurPage((c) => c - 1)}
						>
							<ChevronLeft className="w-4 h-4" />
						</button>
					)}
					<div className="absolute flex gap-6 right-0 top-1/2 translate-y-[-50%]">
						<button
							onClick={() => {
								if (isEditMode) {
									setLedgerToEdit(undefined)
								}
								setCurPage((c) => c + 1)
							}}
						>
							{isEditMode ? (
								<PlusIcon className="w-4 h-4" />
							) : (
								<PencilIcon className="w-4 h-4" />
							)}
						</button>
						<DialogClose ref={closeRef}>
							<X className="w-4 h-4" />
						</DialogClose>
					</div>
				</div>
				<DialogDescription></DialogDescription>
			</DialogHeader>
			<AlertDialog>
				<Command className="h-full w-full gap-4 rounded-none">
					<div className="grid grid-cols-[1fr_auto] border rounded-md cmdk-input-no-border ">
						<CommandInput
							className="text-base"
							placeholder="Search for a ledger..."
						/>
					</div>
					<CommandEmpty className="flex flex-col h-full items-center gap-2 py-4">
						<span className="text-center">No ledger found</span>
						<div className="flex gap-2">
							<Button>Create a ledger</Button>
							<Button variant="outline">Reset</Button>
						</div>
					</CommandEmpty>
					<CommandList className="max-h-none overflow-y-auto flex-1 px-1">
						<CommandGroup className="">
							{ledgersQuery.data?.data?.map((val) => (
								<CommandItem
									className="border flex justify-between items-center rounded-md break-words cursor-pointer p-4 first:mt-0 last:mb-0 my-2"
									key={val.name}
									value={val.name}
									onSelect={() => {
										if (isEditMode) {
											setLedgerToEdit(val)
											setCurPage((c) => c + 1)
										} else {
											selectLedgerMutation.mutate(
												{ id: val.id },
												{
													onSuccess: async (data) => {
														if (data === undefined) {
															toast({
																description:
																	"Failed to switch to the specified ledger.",
																variant: "destructive"
															})
															return
														}

														queryClient.invalidateQueries({
															queryKey: USER_SETTINGS_QKEY
														})
														closeRef.current?.click()

														toast({
															description: (
																<>
																	Switched to the ledger:{" "}
																	<b>{data.data?.ledger?.name}</b>
																</>
															),
															duration: 1500
														})
													}
												}
											)
										}
									}}
								>
									<p className="w-full">{val.name} </p>
									{isEditMode && (
										<AlertDialogTrigger
											onClick={(e) => {
												if (
													ledgersQuery.data?.data?.length !== undefined &&
													ledgersQuery.data?.data.length < 2
												) {
													e.preventDefault()
													e.stopPropagation()
													toast({
														description:
															"Unable to delete the ledger. User must have at least one ledger.",
														variant: "destructive"
													})
													return
												}

												e.stopPropagation()
												setLedgerToDelete(val)
											}}
										>
											<Trash2Icon className="w-4 h-4 stroke-destructive" />
										</AlertDialogTrigger>
									)}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
				<AlertDialogContent onCloseAutoFocus={(e) => e.preventDefault()}>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete ledger</AlertDialogTitle>
						<AlertDialogDescription>
							This action will also delete{" "}
							<b>{ledgerToBeDelete?.entry[0].count}</b> transaction records
							associated with the ledger. Are you sure that you want to delete
							the ledger: <b>{ledgerToBeDelete?.name}</b>?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								if (ledgerToBeDelete === undefined) {
									toast({
										description: "No ledger provided"
									})
									return
								}

								deleteLedgerMutation.mutate(
									{
										id: ledgerToBeDelete.id
									},
									{
										onSuccess: async (data) => {
											toast({
												description: "Ledger deleted",
												duration: 1500
											})

											await settingsQuery.refetch()
											await queryClient.invalidateQueries({
												queryKey: LEDGER_QKEY
											})
										}
									}
								)
							}}
							variant="destructive"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
