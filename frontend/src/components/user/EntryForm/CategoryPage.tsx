import { useForm, useFormContext, UseFormReturn } from "react-hook-form"
import { EntryFormContext, EntryFormItem, FormSchema } from "./EntryForm"
import {
	DialogClose,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog"
import { useContext, useState } from "react"
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
	const { setCurPage } = useContext(EntryFormContext)
	const [isFormLoading, setIsFormLoading] = useState(false)

	const form = useFormContext<FormSchema>()
	const { toast } = useToast()

	const userQuery = useUserQuery()
	const categoriesQuery = useCategoriesQuery()

	const nameForm = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: ""
		}
	})

	const addCategoryMutation = useMutation({
		mutationKey: CATEGORIES_QKEY,
		mutationFn: async (data: z.infer<typeof formSchema>) => {
			if (!userQuery.data?.data || !userQuery.data.data.user) {
				return null
			}

			return await sbBrowser
				.from("category")
				.insert({
					created_by: userQuery.data.data.user.id,
					name: data.name
				})
				.select()
		}
	})

	return (
		<div className="grid grid-rows-[auto_1fr]">
			<DialogHeader className="relative space-y-0 sm:text-center">
				<DialogTitle className="leading-6" asChild>
					<h1 className="h-6 leading-6">Create a new category</h1>
				</DialogTitle>
				<button
					className="absolute block left-0 top-1/2 translate-y-[-50%]"
					onClick={() => setCurPage(1)}
				>
					<ChevronLeft className="w-4 h-4" />
				</button>
				<DialogClose className="absolute block right-0 top-1/2 translate-y-[-50%]">
					<X className="w-4 h-4" />
				</DialogClose>
				<DialogDescription>
					<VisuallyHidden>
						Create a new category and apply it to the current entry
					</VisuallyHidden>
				</DialogDescription>
			</DialogHeader>
			<div className="flex flex-col h-full">
				<p className="text-sm text-muted-foreground mt-8">
					Enter the name of the new category. Please note that no two categories
					may share the same name.
				</p>
				<Form {...nameForm}>
					<form
						className="h-full grid grid-rows-[1fr_auto]"
						onSubmit={(e) => {
							e.preventDefault()
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

								addCategoryMutation.mutate(
									{ name: formData.name },
									{
										onSuccess: (successData) => {
											if (!successData || !successData.data) {
												toast({
													description: "No user data found",
													variant: "destructive"
												})
												return
											}

											toast({
												description: "New category created"
											})

											form.setValue("category.id", successData.data[0].id)
											form.setValue("category.name", successData.data[0].name)
											form.setValue(
												"category.is_default",
												successData.data[0].created_by === null
											)
											setCurPage(0)
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
