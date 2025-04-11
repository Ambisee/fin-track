"use client"

import { LEDGER_QKEY, USER_SETTINGS_QKEY } from "@/lib/constants"
import { useSettingsQuery } from "@/lib/hooks"
import { EntryFormState } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Entry } from "@/types/supabase"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { DialogContent } from "../../ui/dialog"
import { FormControl, FormItem, FormLabel } from "../../ui/form"
import CategoryGroup from "../CategoryGroup"
import LedgerGroup from "../LedgerGroup"
import EntryFormPage from "./EntryFormPage"

interface EntryFormProps {
	data?: Entry
	onSubmitSuccess: EntryFormState["onSubmitSuccess"]
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

export type EntryFormData = z.infer<typeof formSchema>

export function EntryFormItem(props: {
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

export default function EntryForm(props: EntryFormProps) {
	const [curPage, setCurPage] = useState(0)

	const queryClient = useQueryClient()
	const settingsQuery = useSettingsQuery()

	const isEditForm = props.data !== undefined
	const currentLedger = settingsQuery.data?.current_ledger

	const form = useForm<EntryFormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			date: new Date(),
			category: "Miscellaneous",
			amount: "",
			type: "Expense",
			note: "",
			ledger: currentLedger ?? -1
		}
	})

	useEffect(() => {
		let defaultValues: EntryFormData = {
			date: new Date(),
			category: "Miscellaneous",
			amount: "",
			type: "Expense",
			note: "",
			ledger: currentLedger ?? -1
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
	}, [props.data, currentLedger, form, isEditForm])

	const Component = [
		<EntryFormPage
			key="entry-form-page"
			data={props.data}
			entryForm={form}
			isEditForm={isEditForm}
			onLedgerButton={() => setCurPage(1)}
			onCategoryButton={() => setCurPage(2)}
			onSubmitSuccess={props.onSubmitSuccess}
		/>,
		<LedgerGroup
			key="ledger-group"
			onBackButton={() => setCurPage(0)}
			shouldUseSelectRequest={false}
			onSelect={(ledger, isEditing) => {
				form.setValue("ledger", ledger.id)
				setCurPage(0)
			}}
			onUpdate={(ledger) => {
				if (ledger.id === currentLedger) {
					queryClient.invalidateQueries({ queryKey: USER_SETTINGS_QKEY })
				}

				queryClient.invalidateQueries({ queryKey: LEDGER_QKEY })
			}}
			onCreate={(ledger) => {
				queryClient.invalidateQueries({ queryKey: LEDGER_QKEY })
			}}
			onDelete={(ledger) => {
				queryClient.invalidateQueries({ queryKey: LEDGER_QKEY })
			}}
		/>,
		<CategoryGroup
			key="category-group"
			onSelect={(category) => {
				form.setValue("category", category.name)
				setCurPage(0)
			}}
			onBackButton={() => {
				setCurPage(0)
			}}
		/>
	]

	return (
		<DialogContent
			hideCloseButton
			className="auto-rows-fr h-dvh max-w-none duration-0 border-0 sm:border sm:h-[90%] sm:min-h-[460px] sm:max-w-lg"
			onOpenAutoFocus={() => {
				form.reset()
				setCurPage(0)
			}}
		>
			{Component[curPage]}
		</DialogContent>
	)
}
