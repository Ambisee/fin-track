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
import { useForm, UseFormReturn } from "react-hook-form"
import { z } from "zod"
import { DialogContent } from "../../ui/dialog"
import { Form, FormControl, FormItem, FormLabel } from "../../ui/form"
import EntryFormPage from "./EntryFormPage"
import ChooseCategoryPage from "./ChooseCategoryPage"
import { useCategoriesQuery } from "@/lib/hooks"
import CategoryPage from "./CategoryPage"

interface EntryFormProps {
	data?: Entry
	onSubmitSuccess?: (data: PostgrestSingleResponse<null>) => void
}

interface EntryFormContextObject {
	curPage: number
	setCurPage: Dispatch<SetStateAction<number>>
	prevPage: number
	setPrevPage: Dispatch<SetStateAction<number>>
}

const EntryFormContext = createContext<EntryFormContextObject>(null!)

const formSchema = z.object({
	date: z.date(),
	category: z.object({
		id: z.number(),
		name: z.string(),
		is_default: z.boolean()
	}),
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
	note: z.string()
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
	const [prevPage, setPrevPage] = useState(0)
	const isEditForm = props.data !== undefined
	const categoriesQuery = useCategoriesQuery()

	const formDefaultValues = useMemo(() => {
		const miscId = categoriesQuery.data?.data?.find(
			(val) => val.name === "Miscellaneous"
		)?.id as number

		let defaultValues: FormSchema = {
			date: new Date(),
			category: {
				id: miscId ?? 12,
				name: "Miscellaneous",
				is_default: true
			},
			amount: "",
			type: "Expense",
			note: ""
		}

		if (!isEditForm || !props.data?.category) {
			return defaultValues
		}

		defaultValues.date = new Date(`${props.data?.date} 00:00`)
		defaultValues.category = {
			id: props.data.category_id,
			name: props.data.category.name,
			is_default: props.data.category.created_by === null
		}
		defaultValues.type = props.data?.is_positive ? "Income" : "Expense"
		defaultValues.amount = props.data?.amount?.toFixed(2) as string
		defaultValues.note = (props.data?.note ?? "") as string

		return defaultValues
	}, [props.data, isEditForm, categoriesQuery])

	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: formDefaultValues
	})

	const renderPage = (form: UseFormReturn<FormSchema>) => {
		if (curPage === 0) {
			return (
				<EntryFormPage
					key="entry-form-page"
					data={props.data}
					isEditForm={isEditForm}
					onSubmitSuccess={props.onSubmitSuccess}
				/>
			)
		}

		if (curPage === 1) {
			return <ChooseCategoryPage key="choose-category-page" />
		}

		return <CategoryPage key="create-category-page" />
	}

	return (
		<EntryFormContext.Provider
			value={{ curPage, setCurPage, prevPage, setPrevPage }}
		>
			<Form {...form}>
				<DialogContent
					hideCloseButton
					className="h-dvh max-w-none duration-0 border-0 sm:border sm:h-auto sm:min-h-[460px] sm:max-w-lg"
				>
					{renderPage(form)}
				</DialogContent>
			</Form>
		</EntryFormContext.Provider>
	)
}

function EntryForm(props: EntryFormProps) {
	return <DialogEntryForm key={props.data?.id} {...props} />
}

export default EntryForm
export { type FormSchema }
export { EntryFormItem, EntryFormContext }
