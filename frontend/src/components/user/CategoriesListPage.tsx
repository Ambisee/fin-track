import { Category } from "@/types/supabase"
import {
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogClose
} from "../ui/dialog"
import {
	Command,
	CommandEmpty,
	CommandList,
	CommandItem,
	CommandInput,
	CommandGroup
} from "../ui/command"
import { ChevronLeft, PencilIcon, PlusIcon, Trash2Icon, X } from "lucide-react"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { ReloadIcon } from "@radix-ui/react-icons"
import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import {
	AlertDialog,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogDescription,
	AlertDialogTitle,
	AlertDialogFooter
} from "../ui/alert-dialog"
import { useToast } from "../ui/use-toast"

interface CommandGroupClass {
	commandItem: string
	commandGroup: string
	commandText: string
}

export interface CategoriesListPageProps {
	currentCategory?: Category
	categoriesList: Category[]

	editModeOnly?: boolean
	isLoading?: boolean
	isInitialized?: boolean
	isEditMode?: boolean

	onBackButton?: () => void
	onAddButton?: () => void
	onSelect?: (category: Category, isEditing: boolean) => Promise<void>
	onDelete?: (category: Category) => Promise<void>
}

const editModeClass: CommandGroupClass = {
	commandItem:
		"border flex justify-between items-center rounded-md break-words cursor-pointer p-4 first:mt-0 last:mb-0 my-2",
	commandGroup: "",
	commandText: ""
}

const selectModeClass: CommandGroupClass = {
	commandItem: "border rounded-md break-words cursor-pointer",
	commandGroup:
		"*:grid *:gap-2 *:grid-cols-[repeat(auto-fill,minmax(125px,1fr))] *:grid-flow-row *:auto-rows-[150px]",
	commandText: "w-full text-sm text-center"
}

export default function CategoriesListPage(props: CategoriesListPageProps) {
	const { toast } = useToast()

	const [isLoading, setIsLoading] = useState(props.isLoading ?? false)
	const [isEditMode, setIsEditMode] = useState(
		!!props.isEditMode || !!props.editModeOnly
	)
	const [categoryToBeDelete, setCategoryToBeDelete] = useState<
		Category | undefined
	>(undefined)

	const classGroup = isEditMode ? editModeClass : selectModeClass

	useEffect(() => {
		setIsLoading(props.isLoading ?? false)
	}, [props.isLoading])

	return (
		<div className="max-h-full relative grid grid-rows-[auto_1fr] gap-4">
			<DialogHeader className="relative space-y-0 sm:text-center h-fit">
				<div className="relative">
					<DialogTitle className="leading-6" asChild>
						<h1 className="h-6 leading-6">Choose a category</h1>
					</DialogTitle>
					{!props.editModeOnly && (isEditMode || props.onBackButton) && (
						<button
							className="absolute block left-0 top-1/2 translate-y-[-50%]"
							onClick={() => {
								if (isEditMode) {
									setIsEditMode(false)
								} else {
									props.onBackButton?.()
								}
							}}
						>
							<ChevronLeft className="w-4 h-4" />
						</button>
					)}
					<div className="absolute flex items-center gap-6 right-0 top-1/2 translate-y-[-50%]">
						<button
							className="h-full aspect-square"
							onClick={() => {
								if (isEditMode) {
									props.onAddButton?.()
								} else {
									setIsEditMode(true)
								}
							}}
						>
							{isEditMode ? (
								<PlusIcon className="w-4 h-4 m-auto" />
							) : (
								<PencilIcon className="w-4 h-4 m-auto" />
							)}
						</button>
						<DialogClose>
							<X className="w-4 h-4" />
						</DialogClose>
					</div>
				</div>
				<DialogDescription>
					<VisuallyHidden>
						Choose the category that will be associated with the current entry
					</VisuallyHidden>
				</DialogDescription>
			</DialogHeader>
			<AlertDialog>
				<Command className="h-full w-full gap-4 rounded-none">
					<div className="grid grid-cols-[1fr_auto] border rounded-md cmdk-input-no-border ">
						<CommandInput
							disabled={isLoading}
							className="text-base"
							placeholder="Search for a category..."
						/>
					</div>
					<CommandEmpty className="flex flex-col h-full items-center gap-2 py-4">
						{props.isInitialized ?? true ? (
							<>
								<span className="text-center">No category found</span>
								<div className="flex gap-2">
									<Button onClick={() => props.onAddButton?.()}>
										Create a category
									</Button>
								</div>
							</>
						) : (
							<div className="h-full w-full flex justify-center items-center">
								<ReloadIcon className="ml-2 h-4 w-4 animate-spin" />
							</div>
						)}
					</CommandEmpty>
					<CommandList className="max-h-none overflow-y-auto flex-1 px-1">
						<CommandGroup className={classGroup.commandGroup}>
							{props.categoriesList.map((val) => (
								<CommandItem
									disabled={isLoading}
									className={classGroup.commandItem}
									key={val.name}
									value={val.name}
									onSelect={() => {
										props.onSelect?.(val, isEditMode)
									}}
								>
									<p className={classGroup.commandText}>{val.name}</p>
									{isEditMode && (
										<AlertDialogTrigger
											onClick={(e) => {
												e.stopPropagation()
												setCategoryToBeDelete(val)
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
						<AlertDialogTitle>Delete category</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure that you want to delete the category:{" "}
							<b>{categoryToBeDelete?.name}</b>?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={async () => {
								if (categoryToBeDelete === undefined) {
									toast({
										description: "No category provided"
									})
									return
								}

								setIsLoading(true)
								await props.onDelete?.(categoryToBeDelete)
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
