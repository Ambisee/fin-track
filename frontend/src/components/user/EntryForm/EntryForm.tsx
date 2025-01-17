"use client"

import { cn } from "@/lib/utils"
import { Category, Entry } from "@/types/supabase"
import { zodResolver } from "@hookform/resolvers/zod"
import { PostgrestSingleResponse } from "@supabase/supabase-js"
import {
	createContext,
	Dispatch,
	SetStateAction,
	useCallback,
	useEffect,
	useMemo,
	useState
} from "react"
import { useForm, UseFormReturn } from "react-hook-form"
import { z } from "zod"
import { DialogContent } from "../../ui/dialog"
import { Form, FormControl, FormItem, FormLabel } from "../../ui/form"
import EntryFormPage from "./EntryFormPage"
import ChooseCategoryPage from "./ChooseCategoryPage"
import CategoryPage from "./CategoryPage"
import EditCategoryPage from "./EditCategoryPage"
import CategoryToEditProvider from "./CategoryProvider"
import DialogPagesProvider, { useDialogPages } from "../DialogPagesProvider"
import { useSettingsQuery } from "@/lib/hooks"
import LedgerStoreProvider from "@/app/(protected)/dashboard/settings/components/GeneralSection/LedgerProvider"
import EntryLedgersListPage from "./EntryLedgersListPage"
import EntryLedgerPage from "./EntryLedgerPage"

interface EntryFormProps {
	data?: Entry
	onSubmitSuccess?: (data: PostgrestSingleResponse<null>) => void
}

const formSchema = z.object({
	date: z.date(),
	category: z.string(),
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
	note: z.string(),
	ledger: z.number()
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
				"grid grid-cols-[minmax(75px,30%)_1fr] items-center space-y-0",
				props.className
			)}
		>
			<FormLabel>{props.label}</FormLabel>
			<FormControl>{props.children}</FormControl>
		</FormItem>
	)
}

function DialogEntryForm(props: EntryFormProps) {
	const isEditForm = props.data !== undefined
	const { curPage, setCurPage } = useDialogPages()
	const settingsQuery = useSettingsQuery()

	// const formDefaultValues = useMemo(() => {
	// 	let defaultValues: FormSchema = {
	// 		date: new Date(),
	// 		category: "Miscellaneous",
	// 		amount: "",
	// 		type: "Expense",
	// 		note: "",
	// 		ledger: settingsQuery.data?.data?.current_ledger ?? -1
	// 	}

	// 	if (!isEditForm || !props.data) {
	// 		return defaultValues
	// 	}

	// 	defaultValues.date = new Date(`${props.data?.date} 00:00`)
	// 	defaultValues.category = props.data.category
	// 	defaultValues.type = props.data.is_positive ? "Income" : "Expense"
	// 	defaultValues.amount = props.data.amount.toFixed(2)
	// 	defaultValues.note = props.data.note ?? ""
	// 	defaultValues.ledger = props.data.ledger ?? -1

	// 	return defaultValues
	// }, [props.data, settingsQuery.data?.data, isEditForm])

	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			date: new Date(),
			category: "Miscellaneous",
			amount: "",
			type: "Expense",
			note: "",
			ledger: settingsQuery.data?.data?.current_ledger ?? -1
		}
	})

	useEffect(() => {
		let defaultValues: FormSchema = {
			date: new Date(),
			category: "Miscellaneous",
			amount: "",
			type: "Expense",
			note: "",
			ledger: settingsQuery.data?.data?.current_ledger ?? -1
		}

		if (!isEditForm || !props.data) {
			form.reset(defaultValues)
			return
		}

		defaultValues.date = new Date(`${props.data?.date} 00:00`)
		defaultValues.category = props.data.category
		defaultValues.type = props.data.is_positive ? "Income" : "Expense"
		defaultValues.amount = props.data.amount.toFixed(2)
		defaultValues.note = props.data.note ?? ""
		defaultValues.ledger = props.data.ledger ?? -1

		form.reset(defaultValues)
		return
	}, [props.data, settingsQuery.data?.data, form, isEditForm])

	// useEffect(() => {
	// 	form.reset(formDefaultValues)
	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// }, [props.data, settingsQuery.data?.data, form])

	const renderPage = (form: UseFormReturn<FormSchema>) => {
		const pages = [
			EntryFormPage,
			ChooseCategoryPage,
			EditCategoryPage,
			CategoryPage,
			(props: any) => <EntryLedgersListPage {...props} />,
			(props: any) => <EntryLedgersListPage isEditMode {...props} />,
			EntryLedgerPage
		]

		const CurrentPage = pages[curPage]

		return (
			<CurrentPage
				data={props.data}
				isEditForm={isEditForm}
				onSubmitSuccess={props.onSubmitSuccess}
			/>
		)
	}

	return (
		<Form {...form}>
			<DialogContent
				hideCloseButton
				className="auto-rows-fr h-dvh max-w-none duration-0 border-0 sm:border sm:h-[90%] sm:min-h-[460px] sm:max-w-lg"
				onOpenAutoFocus={() => {
					form.reset()
					setCurPage(0)
				}}
			>
				{renderPage(form)}
			</DialogContent>
		</Form>
	)
}

function EntryForm(props: EntryFormProps) {
	return (
		<DialogPagesProvider>
			<LedgerStoreProvider>
				<CategoryToEditProvider>
					<DialogEntryForm {...props} />
				</CategoryToEditProvider>
			</LedgerStoreProvider>
		</DialogPagesProvider>
	)
}

export default EntryForm
export { type FormSchema }
export { EntryFormItem }
