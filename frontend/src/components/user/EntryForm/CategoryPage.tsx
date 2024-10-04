import { useForm, useFormContext, UseFormReturn } from "react-hook-form"
import { EntryFormItem, FormSchema } from "./EntryForm"
import {
	DialogClose,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog"
import { useState } from "react"
import { useEntryFormStore } from "./EntryFormProvider"
import { ChevronLeft, X } from "lucide-react"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useCategoriesQuery, useUserQuery } from "@/lib/hooks"
import { useToast } from "@/components/ui/use-toast"
import { useMutation } from "@tanstack/react-query"
import { CATEGORIES_QKEY } from "@/lib/constants"
import { sbBrowser } from "@/lib/supabase"

interface CategoryPageProps {}

const formSchema = z.object({
	name: z.string()
})

export default function CategoryPage(props: CategoryPageProps) {
	const [isFormLoading, setIsFormLoading] = useState(false)

	const { toast } = useToast()
	const form = useFormContext<FormSchema>()
	const setCurPage = useEntryFormStore()((state) => state.setCurPage)
	const categoryToEdit = useEntryFormStore()((state) => state.categoryToEdit)

	const userQuery = useUserQuery()
	const categoriesQuery = useCategoriesQuery()

	const nameForm = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: ""
		}
	})

	const updateCategoryMutation = useMutation({
		mutationKey: CATEGORIES_QKEY,
		mutationFn: async (data: z.infer<typeof formSchema>) => {
			if (
				!userQuery.data?.data ||
				!userQuery.data.data.user ||
				!categoryToEdit
			) {
				return null
			}

			const result = await sbBrowser
				.from("category")
				.update({ name: data.name })
				.eq("created_by", userQuery.data.data.user.id)
				.eq("id", categoryToEdit.id)
                .select()

			return result
		}
	})

	const insertCategoryMutation = useMutation({
		mutationKey: CATEGORIES_QKEY,
		mutationFn: async (data: z.infer<typeof formSchema>) => {
			if (!userQuery.data?.data || !userQuery.data.data.user) {
				return null
			}

			const result = await sbBrowser
				.from("category")
				.insert({
					created_by: userQuery.data.data.user.id,
					name: data.name
				})
				.select()

			return result
		}
	})

	return (
		<div className="grid grid-rows-[auto_1fr]">
			<DialogHeader className="relative space-y-0 sm:text-center">
				<DialogTitle className="leading-6" asChild>
					<h1 className="h-6 leading-6">
						{categoryToEdit
							? `Edit category - ${categoryToEdit.name}`
							: "Create a new category"}
					</h1>
				</DialogTitle>
				<button
					className="absolute block left-0 top-1/2 translate-y-[-50%]"
					onClick={() => setCurPage((c) => c - 1)}
				>
					<ChevronLeft className="w-4 h-4" />
				</button>
				<DialogClose className="absolute block right-0 top-1/2 translate-y-[-50%]">
					<X className="w-4 h-4" />
				</DialogClose>
				<DialogDescription>
					<VisuallyHidden>
						{categoryToEdit
							? "Edit the specified category"
							: "Create a new category and apply it to the current entry"}
					</VisuallyHidden>
				</DialogDescription>
			</DialogHeader>
			<div className="flex flex-col h-full">
				<p className="text-sm text-muted-foreground mt-8">
					Enter the name of the {!categoryToEdit && "new"} category. Please note
					that no two categories may share the same name.
				</p>
				<Form {...nameForm}>
					<form
						className="h-full grid grid-rows-[1fr_auto]"
						onSubmit={(e) => {
							e.preventDefault()
							setIsFormLoading(true)
							nameForm.handleSubmit((formData) => {
								if (!userQuery.data?.data) {
									return
								}

								if (!categoriesQuery.data?.data) {
									toast({
										description:
											"The category name has been used. Please enter another name",
										variant: "destructive"
									})
									return
								}

								const isUpdate = !categoryToEdit
								const mutation = isUpdate
									? updateCategoryMutation
									: insertCategoryMutation

								mutation.mutate(
									{ name: formData.name },
									{
										onSuccess: (successData) => {
											if (!successData) return
											if (successData?.error?.code === "23505") {
												toast({
													description:
														"The category name has been used. Please enter another one",
													variant: "destructive"
												})
												setIsFormLoading(false)
												return
											}

											toast({
												description: isUpdate
													? "Category updated"
													: "New category created"
											})

											setIsFormLoading(false)
											if (isUpdate) {
												setCurPage((c) => c - 1)
												return
											}

											setCurPage(0)
											if (successData.data)
												form.setValue("category", successData.data[0].name)
										}
									}
								)
							})()
						}}
					>
						<FormField
							control={nameForm.control}
							name="name"
							render={({ field }) => (
								<FormItem className="mt-2">
									<FormControl>
										<Input placeholder="Enter a new category name" {...field} />
									</FormControl>
								</FormItem>
							)}
						/>
						<DialogFooter>
							<Button>Create category</Button>
						</DialogFooter>
					</form>
				</Form>
			</div>
		</div>
	)
}
