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
import { useCategoriesQuery, useUserQuery } from "@/lib/hooks"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { ChevronLeft, PlusIcon, Trash2Icon, X } from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { EntryFormContext, FormSchema } from "./EntryForm"
import { useFormContext } from "react-hook-form"
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
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CATEGORIES_QKEY, ENTRY_QKEY } from "@/lib/constants"
import { sbBrowser } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { getElementFromNode } from "@/lib/utils"

interface ChooseCategoryPageProps {}

export default function ChooseCategoryPage(props: ChooseCategoryPageProps) {
	const { setCurPage } = useContext(EntryFormContext)
	const [deleteCategoryId, setDeleteCategoryId] = useState(-1)

	const { toast } = useToast()
	const form = useFormContext<FormSchema>()
	const queryClient = useQueryClient()

	const userQuery = useUserQuery()
	const categoriesQuery = useCategoriesQuery()

	const deleteCategoryMutation = useMutation({
		mutationKey: CATEGORIES_QKEY,
		mutationFn: async (data: { id: number }) => {
			if (!categoriesQuery.data?.data || !userQuery.data?.data.user) return

			return await sbBrowser.from("category").delete().eq("id", data.id)
		}
	})

	useEffect(() => {
		const cmdkInputWrapper = document.querySelector("[cmdk-input-wrapper]")
		if (cmdkInputWrapper === null) return

		cmdkInputWrapper.classList.remove("border-b")
	}, [])

	return (
		<div className="max-h-full relative grid grid-rows-[auto_1fr] gap-4">
			{/* <AlertDialogContent onCloseAutoFocus={(e) => e.preventDefault()}>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete category</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure that you want to delete this category. Any entries
						under this category will revert to the &apos;Miscellaneous&apos;
						category
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={() => {
							deleteCategoryMutation.mutate(
								{ id: deleteCategoryId },
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
			</AlertDialogContent> */}
			<DialogHeader className="relative space-y-0 sm:text-center h-fit">
				<DialogTitle className="leading-6" asChild>
					<h1 className="h-6 leading-6">Choose a category</h1>
				</DialogTitle>
				<button
					className="absolute block left-0 top-1/2 translate-y-[-50%]"
					onClick={() => setCurPage(0)}
				>
					<ChevronLeft className="w-4 h-4" />
				</button>
				<DialogClose className="absolute block right-0 top-1/2 translate-y-[-50%]">
					<X className="w-4 h-4" />
				</DialogClose>
				<DialogDescription>
					<VisuallyHidden>
						Choose the category that will be associated with the current entry
					</VisuallyHidden>
				</DialogDescription>
			</DialogHeader>
			<Command
				className="h-full w-full gap-4"
				defaultValue={form.getValues("category")}
			>
				<div className="grid items-center grid-cols-[1fr_auto] border-b">
					<CommandInput
						className="text-base border-none"
						placeholder="Search for a category..."
					/>
					<button
						onClick={() => {
							setCurPage(2)
						}}
						className="flex w-11 h-11 items-center justify-center focus:bg-transparent"
					>
						<PlusIcon className="w-4 h-4" />
					</button>
				</div>
				<CommandEmpty className="flex flex-col h-full items-center gap-2 py-4">
					<span className="text-center">No category found</span>
					<div className="flex gap-2">
						<Button>Create a category</Button>
						<Button variant="outline">Reset</Button>
					</div>
				</CommandEmpty>
				<CommandList className="max-h-none overflow-y-auto flex-1 px-1">
					<CommandGroup className="*:grid *:gap-2 *:grid-cols-[repeat(auto-fill,minmax(125px,1fr))] *:grid-flow-row *:auto-rows-[150px]">
						{categoriesQuery.data?.data?.map((val) => (
							<CommandItem
								className="border rounded-md break-words cursor-pointer"
								key={val.name}
								value={val.name}
								onSelect={(e) => {
									form.setValue("category", val.name)
									setCurPage(0)
								}}
							>
								<p className="w-full text-sm text-center">{val.name}</p>
							</CommandItem>
						))}
					</CommandGroup>
				</CommandList>
			</Command>
		</div>
	)
}
