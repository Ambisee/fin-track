import InputSkeleton from "@/components/user/InputSkeleton"
import { Category } from "@/types/supabase"
import { zodResolver } from "@hookform/resolvers/zod"
import { ReloadIcon } from "@radix-ui/react-icons"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { ChevronLeft, X } from "lucide-react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "../ui/button"
import {
	DialogClose,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from "../ui/dialog"
import { Field, FieldGroup, FieldLabel } from "../ui/field"
import { Input } from "../ui/input"

export type CategoryFormData = Pick<Category, "name"> & {
	oldName: string
}

export interface CategoryPageProps {
	data?: Category

	isLoading?: boolean
	isInitialized?: boolean

	onBackButton?: () => void
	onCreate?: (category: CategoryFormData) => Promise<void>
	onUpdate?: (category: CategoryFormData) => Promise<void>
}

const formSchema = z.object({
	name: z.string()
})

export default function CategoryPage(props: CategoryPageProps) {
	const [isFormLoading, setIsFormLoading] = useState(false)

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: props.data?.name ?? ""
		}
	})

	const isInputEnabled = props.isLoading !== true && !isFormLoading

	return (
		<div className="grid grid-rows-[auto_1fr]">
			<DialogHeader className="relative space-y-0 sm:text-center">
				<DialogTitle className="leading-6" asChild>
					<h1 className="h-6 leading-6">
						{props.data !== undefined
							? `Edit category - ${props.data.name}`
							: "Create a new category"}
					</h1>
				</DialogTitle>
				<button
					className="absolute block left-0 top-1/2 translate-y-[-50%]"
					onClick={() => props.onBackButton?.()}
				>
					<ChevronLeft className="w-4 h-4" />
				</button>
				<DialogClose className="absolute block right-0 top-1/2 translate-y-[-50%]">
					<X className="w-4 h-4" />
				</DialogClose>
				<DialogDescription>
					<VisuallyHidden>
						{props.data !== undefined
							? "Edit the specified category"
							: "Create a new category and apply it to the current entry"}
					</VisuallyHidden>
				</DialogDescription>
			</DialogHeader>
			<div className="flex flex-col h-full gap-4">
				<p className="text-sm text-muted-foreground mt-8">
					Enter the name of the {props.data === undefined && "new"} category.
					Please note that no two categories may share the same name.
				</p>
				<form
					className="h-full grid grid-rows-[1fr_auto]"
					onSubmit={(e) => {
						e.preventDefault()
						form.handleSubmit(async (formData) => {
							setIsFormLoading(true)

							if (props.data !== undefined) {
								await props.onUpdate?.({
									oldName: props.data.name,
									...formData
								})
							} else {
								await props.onCreate?.({
									oldName: "",
									...formData
								})
							}

							setIsFormLoading(false)
						})()
					}}
				>
					<FieldGroup>
						<Controller
							control={form.control}
							name="name"
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid} className="mt-2">
									<FieldLabel className="sr-only">Category name</FieldLabel>
									{(props.isInitialized ?? true) ? (
										<Input
											disabled={!isInputEnabled}
											placeholder="Enter a new category name"
											aria-invalid={fieldState.invalid}
											{...field}
										/>
									) : (
										<InputSkeleton />
									)}
								</Field>
							)}
						/>
					</FieldGroup>
					<DialogFooter>
						<Button
							disabled={!(props.isInitialized ?? true) || !isInputEnabled}
						>
							{props.data === undefined ? "Create category" : "Update category"}
							{!isInputEnabled && (
								<ReloadIcon className="ml-2 h-4 w-4 relative animate-spin" />
							)}
						</Button>
					</DialogFooter>
				</form>
			</div>
		</div>
	)
}
