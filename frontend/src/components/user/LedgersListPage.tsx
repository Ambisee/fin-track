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
import { Ledger } from "@/types/supabase"
import { ReloadIcon } from "@radix-ui/react-icons"
import { ChevronLeft, PencilIcon, PlusIcon, Trash2Icon, X } from "lucide-react"
import { useState } from "react"

export interface LedgersListPageProps {
	currentLedger?: Omit<Ledger, "entry">
	ledgersList: Ledger[]
	isLoading: boolean

	isEditMode?: boolean

	onBackButton?: () => void
	onAddButton?: () => void
	onSelect?: (ledger: Ledger, isEditing: boolean) => void
	onDelete?: (ledger: Ledger) => void
}

export default function LedgersListPage(props: LedgersListPageProps) {
	const [isEditMode, setIsEditMode] = useState<boolean>(!!props.isEditMode)
	const [ledgerToBeDelete, setLedgerToDelete] = useState<Ledger | undefined>(
		undefined
	)

	const { toast } = useToast()

	// const selectLedgerMutation = useMutation({
	// 	mutationKey: USER_SETTINGS_QKEY,
	// 	mutationFn: async (data: { id: number }) => {
	// 		if (userQuery.data?.data.user?.id === undefined) {
	// 			return undefined
	// 		}

	// 		const { data: result, error } = await sbBrowser
	// 			.from("settings")
	// 			.update({ current_ledger: data.id })
	// 			.eq("user_id", userQuery.data?.data.user.id as string)
	// 			.select("*, ledger (name)")
	// 			.single()

	// 		if (error) {
	// 			throw error
	// 		}

	// 		return result
	// 	},
	// 	onSuccess: async (data) => {
	// 		if (data === undefined) {
	// 			toast({
	// 				description: "Failed to switch to the specified ledger.",
	// 				variant: "destructive"
	// 			})
	// 			return
	// 		}

	// 		queryClient.invalidateQueries({
	// 			queryKey: USER_SETTINGS_QKEY
	// 		})
	// 		closeRef.current?.click()

	// 		toast({
	// 			description: (
	// 				<>
	// 					Switched to the ledger: <b>{data.ledger?.name}</b>
	// 				</>
	// 			),
	// 			duration: 1500
	// 		})
	// 	}
	// })

	// const deleteLedgerMutation = useMutation({
	// 	mutationKey: LEDGER_QKEY,
	// 	mutationFn: async (data: { id: number }) => {
	// 		const ledgersCount = ledgersQuery.data?.data?.length
	// 		if (!ledgersCount) {
	// 			throw Error("An unexpected error occured. Please try again later.")
	// 		}

	// 		if (ledgersCount < 2) {
	// 			throw Error(
	// 				"Unable to delete the ledger. User must have at least one ledger."
	// 			)
	// 		}

	// 		const { data: result, error } = await sbBrowser
	// 			.from("ledger")
	// 			.delete()
	// 			.eq("id", data.id)
	// 			.select("*, currency (currency_name), entry(count)")
	// 			.single()

	// 		if (error) {
	// 			throw Error("Unable to delete the ledger", { cause: error })
	// 		}

	// 		return result
	// 	}
	// })

	return (
		<div className="h-full grid gap-4 grid-rows-[auto_1fr]">
			<DialogHeader className="space-y-0 sm:text-center h-fit">
				<div className="relative">
					<DialogTitle className="leading-6" asChild>
						<h2 className="h-6 leading-6">
							{isEditMode
								? "Select a ledger to edit"
								: "Select a ledger to view"}
						</h2>
					</DialogTitle>
					{(isEditMode || props.onBackButton) && (
						<button
							className="absolute block left-0 top-1/2 translate-y-[-50%]"
							onClick={
								isEditMode ? () => setIsEditMode(false) : props.onBackButton
							}
						>
							<ChevronLeft className="w-4 h-4" />
						</button>
					)}
					<div className="absolute flex gap-6 right-0 top-1/2 translate-y-[-50%]">
						<button
							onClick={() => {
								if (isEditMode) {
									props.onAddButton?.()
								}
								setIsEditMode(true)
							}}
						>
							{isEditMode ? (
								<PlusIcon className="w-4 h-4" />
							) : (
								<PencilIcon className="w-4 h-4" />
							)}
						</button>
						<DialogClose>
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
						{!props.isLoading ? (
							<>
								<span className="text-center">No ledger found</span>
								<div className="flex gap-2">
									<Button>Create a ledger</Button>
									<Button variant="outline">Reset</Button>
								</div>
							</>
						) : (
							<div className="h-full w-full flex justify-center items-center">
								<ReloadIcon className="ml-2 h-4 w-4 animate-spin" />
							</div>
						)}
					</CommandEmpty>
					<CommandList className="max-h-none h-full overflow-y-auto flex-1 px-1">
						<CommandGroup className="">
							{props.ledgersList.map((val) => (
								<CommandItem
									className="border flex justify-between items-center rounded-md break-words cursor-pointer p-4 first:mt-0 last:mb-0 my-2"
									key={val.name}
									value={val.name}
									onSelect={() => {
										props.onSelect?.(val, isEditMode)
									}}
								>
									<p className="w-full">{val.name} </p>
									{isEditMode && val.id !== props.currentLedger?.id && (
										<AlertDialogTrigger
											onClick={(e) => {
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

								props.onDelete?.(ledgerToBeDelete)

								// deleteLedgerMutation.mutate(
								// 	{ id: ledgerToBeDelete.id },
								// 	{
								// 		onSuccess: (successData) => {
								// 			toast({
								// 				description: "Ledger deleted",
								// 				duration: 1500
								// 			})

								// 			props.onDelete?.(successData)
								// 		},
								// 		onError: (error) => {
								// 			toast({
								// 				description: error.message,
								// 				variant: "destructive"
								// 			})
								// 		}
								// 	}
								// )
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
