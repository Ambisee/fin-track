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
import { useEffect, useState } from "react"

export interface LedgersListPageProps {
	currentLedger?: Omit<Ledger, "entry">
	ledgersList: Ledger[]

	isLoading?: boolean
	isInitialized?: boolean
	isEditMode?: boolean

	onBackButton?: () => void
	onAddButton?: () => void
	onSelect?: (ledger: Ledger, isEditing: boolean) => Promise<void>
	onDelete?: (ledger: Ledger) => Promise<void>
}

export default function LedgersListPage(props: LedgersListPageProps) {
	const { toast } = useToast()

	const [isLoading, setIsLoading] = useState(props.isLoading ?? false)
	const [isEditMode, setIsEditMode] = useState<boolean>(!!props.isEditMode)
	const [ledgerToBeDelete, setLedgerToDelete] = useState<Ledger | undefined>(
		undefined
	)

	useEffect(() => {
		setIsLoading(props.isLoading ?? false)
	}, [props.isLoading])

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
							disabled={isLoading}
							className="text-base"
							placeholder="Search for a ledger..."
						/>
					</div>
					<CommandEmpty className="flex flex-col h-full items-center gap-2 py-4">
						{props.isInitialized ?? true ? (
							<>
								<span className="text-center">No ledger found</span>
								<div className="flex gap-2">
									<Button onClick={() => props.onAddButton?.()}>
										Create a ledger
									</Button>
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
									disabled={!(props.isInitialized ?? true) || isLoading}
									onSelect={async () => {
										setIsLoading(true)
										await props.onSelect?.(val, isEditMode)
										setIsLoading(false)
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
							onClick={async () => {
								if (ledgerToBeDelete === undefined) {
									toast({
										description: "No ledger provided"
									})
									return
								}

								setIsLoading(true)
								await props.onDelete?.(ledgerToBeDelete)
								setIsLoading(false)
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
