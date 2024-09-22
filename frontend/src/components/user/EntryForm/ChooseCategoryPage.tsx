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
		<AlertDialog>
			<AlertDialogContent onCloseAutoFocus={(e) => e.preventDefault()}>
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
											queryKey: ENTRY_QKEY
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
			<div className="relative h-full grid grid-rows-[auto_1fr] gap-8 sm:gap-4">
				<DialogHeader className="relative space-y-0 sm:text-center">
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
				<div className="w-full h-full">
					<Command defaultValue={form.getValues("category.name")}>
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
						<CommandEmpty className="grid justify-center gap-2 py-4">
							<span className="text-center">No category found</span>
							<div className="flex gap-2">
								<Button>Create a category</Button>
								<Button variant="outline">Reset</Button>
							</div>
						</CommandEmpty>
						<CommandGroup className="*:text-sm" heading="Current">
							<CommandItem
								key={form.watch("category.name")}
								value={form.watch("category.name")}
								onSelect={(e) => {
									setCurPage(0)
								}}
							>
								<span>{form.watch("category.name")}</span>
								{!form.watch("category.is_default") && (
									<AlertDialogTrigger asChild>
										<button
											type="button"
											className="ml-auto"
											onClick={(e) => {
												e.stopPropagation()
												setDeleteCategoryId(form.watch("category.id"))
											}}
										>
											<Trash2Icon className="w-4 h-4" />
										</button>
									</AlertDialogTrigger>
								)}
							</CommandItem>
						</CommandGroup>
						<CommandGroup heading="Other category">
							<CommandList>
								{categoriesQuery.data?.data?.map((val) =>
									form.getValues("category.id") !== val.id ? (
										<CommandItem
											key={val.name}
											value={val.name}
											onSelect={(e) => {
												form.setValue("category", {
													id: val.id,
													name: val.name,
													is_default: val.created_by === null
												})
												setCurPage(0)
											}}
										>
											<span>{val.name}</span>
											{!(val.created_by === null) && (
												<AlertDialogTrigger asChild>
													<button
														type="button"
														className="ml-auto"
														onClick={(e) => {
															e.stopPropagation()
															setDeleteCategoryId(val.id)
														}}
													>
														<Trash2Icon className="w-4 h-4" />
													</button>
												</AlertDialogTrigger>
											)}
										</CommandItem>
									) : undefined
								)}
							</CommandList>
						</CommandGroup>
					</Command>
				</div>
			</div>
		</AlertDialog>
	)
}
