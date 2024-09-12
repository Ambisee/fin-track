"use client"

import { cn } from "@/lib/utils"
import { Entry } from "@/types/supabase"
import { zodResolver } from "@hookform/resolvers/zod"
import { PostgrestSingleResponse } from "@supabase/supabase-js"
import {
	createContext,
	Dispatch,
	SetStateAction,
	useMemo,
	useState
} from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { DialogContent } from "../../ui/dialog"
import { FormControl, FormItem, FormLabel } from "../../ui/form"
import EntryFormPage from "./EntryFormPage"
import ChooseCategoryPage from "./ChooseCategoryPage"

interface EntryFormProps {
	data?: Entry
	onSubmitSuccess?: (data: PostgrestSingleResponse<null>) => void
}

interface EntryFormContextObject {
	curPage: number
	setCurPage: Dispatch<SetStateAction<number>>
}

const EntryFormContext = createContext<EntryFormContextObject>(null!)

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

type FormSchema = z.infer<typeof formSchema>

function EntryFormItem(props: {
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
	const [curPage, setCurPage] = useState(0)
	const isEditForm = props.data !== undefined

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
		<EntryFormContext.Provider value={{ curPage, setCurPage }}>
			<DialogContent
				hideCloseButton
				className="h-dvh max-w-none duration-0 border-0 sm:border sm:h-auto sm:min-h-[460px] sm:max-w-lg"
			>
				<EntryFormPage
					form={form}
					data={props.data}
					isEditForm={isEditForm}
					onSubmitSuccess={props.onSubmitSuccess}
				/>
			</DialogContent>
		</EntryFormContext.Provider>
	)
}

function EntryForm(props: EntryFormProps) {
	return <DialogEntryForm {...props} />
}

export default EntryForm
export { EntryFormItem, type FormSchema }
