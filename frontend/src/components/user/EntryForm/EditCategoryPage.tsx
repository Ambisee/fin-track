import {
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogClose
} from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { FormSchema } from "./EntryForm"
import { useFormDialog } from "./FormDialogProvider"

import {
	X,
	ChevronLeft,
	PencilIcon,
	Trash2Icon,
	SearchIcon,
	Search,
	PlusIcon
} from "lucide-react"
import { useFormContext, UseFormReturn } from "react-hook-form"
import { useState } from "react"
import {
	AlertDialog,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogCancel,
	AlertDialogAction,
	AlertDialogTitle,
	AlertDialogHeader,
	AlertDialogFooter,
	AlertDialogDescription
} from "@/components/ui/alert-dialog"
import { useCategoriesQuery, useUserQuery } from "@/lib/hooks"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CATEGORIES_QKEY } from "@/lib/constants"
import { useToast } from "@/components/ui/use-toast"
import { sbBrowser } from "@/lib/supabase"
import { Category } from "@/types/supabase"
import {
	Command,
	CommandInput,
	CommandList,
	CommandGroup,
	CommandItem,
	CommandEmpty
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"

interface EditCategoryPageProps {
	showBackButton?: boolean
}

export default function EditCategoryPage(props: EditCategoryPageProps) {
	const { toast } = useToast()
	const form = useFormContext()
	const queryClient = useQueryClient()
	const setCurPage = useFormDialog()((state) => state.setCurPage)
	const setCategoryToEdit = useFormDialog()((state) => state.setCategoryToEdit)
	const [categoryToBeDelete, setCategoryToBeDelete] = useState<
		Category | undefined
	>(undefined)

	const userQuery = useUserQuery()
	const categoriesQuery = useCategoriesQuery()

	const showBackButton = props.showBackButton ?? true

	const deleteCategoryMutation = useMutation({
		mutationKey: CATEGORIES_QKEY,
		mutationFn: async (data: { created_by: string; name: string }) => {
			if (!categoriesQuery.data?.data || !userQuery.data?.data.user) return

			return await sbBrowser
				.from("category")
				.delete()
				.eq("created_by", data.created_by)
				.eq("name", data.name)
		}
	})

	return (
		<div className="h-full grid gap-4 grid-rows-[auto_1fr]">
			<DialogHeader className="space-y-0 sm:text-center h-fit">
				<div className="relative">
					<DialogTitle className="leading-6" asChild>
						<h1 className="h-6 leading-6">Edit categories</h1>
					</DialogTitle>
					{showBackButton && (
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
								setCategoryToEdit(undefined)
								setCurPage((c) => c + 1)
							}}
						>
							<PlusIcon className="w-4 h-4" />
						</button>
						<DialogClose>
							<X className="w-4 h-4" />
						</DialogClose>
					</div>
				</div>
				<DialogDescription>Select a category to edit</DialogDescription>
			</DialogHeader>
			<AlertDialog>
				<Command
					className="h-full w-full gap-4 rounded-none"
					defaultValue={form.getValues("category")}
				>
					<div className="grid grid-cols-[1fr_auto] border rounded-md cmdk-input-no-border ">
						<CommandInput
							className="text-base"
							placeholder="Search for a category..."
						/>
					</div>
					<CommandEmpty className="flex flex-col h-full items-center gap-2 py-4">
						<span className="text-center">No category found</span>
						<div className="flex gap-2">
							<Button>Create a category</Button>
							<Button variant="outline">Reset</Button>
						</div>
					</CommandEmpty>
					<CommandList className="max-h-none overflow-y-auto flex-1 px-1">
						<CommandGroup className="">
							{categoriesQuery.data?.data?.map((val) => (
								<CommandItem
									className="border flex justify-between items-center rounded-md break-words cursor-pointer p-4 first:mt-0 last:mb-0 my-2"
									key={val.name}
									value={val.name}
									onSelect={() => {
										setCategoryToEdit(val)
										setCurPage((c) => c + 1)
									}}
								>
									<p className="w-full">{val.name}</p>
									<AlertDialogTrigger
										onClick={(e) => {
											e.stopPropagation()
											setCategoryToBeDelete(val)
										}}
									>
										<Trash2Icon className="w-4 h-4 stroke-destructive" />
									</AlertDialogTrigger>
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
							onClick={() => {
								if (categoryToBeDelete === undefined) {
									toast({
										description: "No category provided"
									})
									return
								}

								deleteCategoryMutation.mutate(
									{
										created_by: categoryToBeDelete.created_by as string,
										name: categoryToBeDelete.name
									},
									{
										onSuccess: async (data) => {
											toast({
												description: "Category deleted",
												duration: 1500
											})

											await queryClient.invalidateQueries({
												queryKey: CATEGORIES_QKEY
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
