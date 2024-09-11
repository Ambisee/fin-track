"use client"

import { useCategoriesQuery, useUserQuery } from "@/lib/hooks"
import { sbBrowser } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { Entry } from "@/types/supabase"
import { zodResolver } from "@hookform/resolvers/zod"
import { PostgrestSingleResponse } from "@supabase/supabase-js"
import { useMutation } from "@tanstack/react-query"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { useMediaQuery } from "react-responsive"
import { z } from "zod"
import { DialogContent } from "../../ui/dialog"
import { FormControl, FormItem, FormLabel } from "../../ui/form"
import { useToast } from "../../ui/use-toast"
import EntryFormPage from "./EntryFormPage"

interface EntryFormProps {
	data?: Entry
	onSubmitSuccess?: (data: PostgrestSingleResponse<null>) => void
}

const formSchema = z.object({
	date: z.date(),
	title: z.string().min(1, "Please provide a transaction title"),
	amount: z
		.preprocess((arg) => (arg === "" ? NaN : Number(arg)), z.coerce.string())
		.pipe(
			z.coerce
				.number({
					invalid_type_error: "Please provide a valid transaction amount"
				})
				.nonnegative("Please provide a non-negative amount")
				.step(0.01, "Please ensure that the value is a multiple of 0.01")
		)
		.pipe(z.coerce.string()),
	type: z.enum(["Income", "Expense"]),
	notes: z.string()
})

export type FormSchema = z.infer<typeof formSchema>

export function EntryFormItem(props: {
	className?: string
	label: string
	children: JSX.Element
}) {
	return (
		<FormItem
			className={cn(
				"my-4 grid grid-cols-[minmax(75px,30%)_1fr] items-center space-y-0",
				props.className
			)}
		>
			<FormLabel>{props.label}</FormLabel>
			<FormControl>{props.children}</FormControl>
		</FormItem>
	)
}

function DialogEntryForm(props: EntryFormProps) {
	const { toast } = useToast()
	const isEditForm = props.data !== undefined
	const { data: userData } = useUserQuery()
	const { data: categoriesData } = useCategoriesQuery()

	const insertMutation = useMutation({
		mutationFn: (formData: FormSchema) => {
			const isPositive = formData.type === "Income"
			let note: string | null = formData.notes
			if (note === "") {
				note = null
			}

			return Promise.resolve(
				sbBrowser.from("entry").insert({
					date: formData.date.toLocaleDateString(),
					title: formData.title,
					created_by: userData?.data.user?.id,
					amount_is_positive: isPositive,
					amount: Number(formData.amount),
					note: note
				})
			)
		}
	})

	const updateMutation = useMutation({
		mutationFn: (formData: FormSchema) => {
			const isPositive = formData.type === "Income"
			if (props.data?.id === undefined) {
				toast({ description: "Invalid entry id" })
				return Promise.reject(null)
			}

			let note: string | null = formData.notes
			if (note === "") {
				note = null
			}

			return Promise.resolve(
				sbBrowser
					.from("entry")
					.update({
						date: formData.date.toDateString(),
						title: formData.title,
						amount_is_positive: isPositive,
						amount: Number(formData.amount),
						note: note
					})
					.eq("id", props.data.id)
			)
		}
	})

	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: useMemo(() => {
			let defaultValues: FormSchema = {
				date: new Date(),
				title: "",
				amount: "",
				type: "Income",
				notes: ""
			}

			if (!isEditForm) {
				return defaultValues
			}

			defaultValues.date = new Date(`${props.data?.date} 00:00`)
			defaultValues.title = props.data?.title as string
			defaultValues.type = props.data?.amount_is_positive ? "Income" : "Expense"
			defaultValues.amount = props.data?.amount?.toFixed(2) as string
			defaultValues.notes = (props.data?.note ?? "") as string

			return defaultValues
		}, [props, isEditForm])
	})

	return (
		<DialogContent
			hideCloseButton
			className="h-dvh max-w-none duration-0 border-0 sm:border sm:h-auto sm:max-w-lg"
		>
			<EntryFormPage
				form={form}
                data={props.data}
				onSubmitSuccess={props.onSubmitSuccess}
				isEditForm={isEditForm}
				updateMutation={updateMutation}
				insertMutation={insertMutation}
			/>
		</DialogContent>
	)
}

export default function EntryForm(props: EntryFormProps) {
	const isDesktop = useMediaQuery({
		minWidth: 768
	})

	return <DialogEntryForm {...props} />
}
