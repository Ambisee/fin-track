import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import {
	DialogClose,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
	useCategoriesQuery,
	useInsertEntryMutation,
	useLedgersQuery,
	useUpdateEntryMutation
} from "@/lib/hooks"
import { Entry } from "@/types/supabase"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { ChevronRight, X } from "lucide-react"
import { Controller, FieldErrors, FieldValues, useForm } from "react-hook-form"
import { EntryFormData, EntryFormItem } from "./EntryForm"

import { EntryFormState } from "@/lib/store"
import { ReloadIcon, ResetIcon } from "@radix-ui/react-icons"
import { ReactNode, useState } from "react"
import { SHORT_TOAST_DURATION } from "@/lib/constants"
import { isNonNullable } from "@/lib/utils"

interface EntryFormPageProps {
	data?: Entry
	isEditForm: boolean
	entryForm: ReturnType<typeof useForm<EntryFormData>>

	onLedgerButton?: () => void
	onCategoryButton?: () => void
	onSubmitSuccess: EntryFormState["onSubmitSuccess"]
}

const getErrors: <T extends FieldValues>(
	errors: FieldErrors<T>
) => ReactNode[] = (errors) => {
	const result = []

	for (const key in errors) {
		const error = errors[key]
		if (error === undefined) continue

		const errorMessage = error.message?.toString()
		result.push(<li key={errorMessage}>{errorMessage}</li>)
	}

	return result
}

export default function EntryFormPage(props: EntryFormPageProps) {
	const [isFormLoading, setIsFormLoading] = useState(false)

	const form = props.entryForm

	const ledgerQuery = useLedgersQuery()
	const categoryQuery = useCategoriesQuery()

	const insertEntryMutation = useInsertEntryMutation()
	const updateEntryMutation = useUpdateEntryMutation()

	const getLedgerName = (ledgerId: number) => {
		return ledgerQuery.data?.find?.((ledger) => ledger.id === ledgerId)?.name
	}

	return (
		<form
			className="grid grid-rows-[1.5rem_1fr_auto] gap-4 h-full"
			onSubmit={(e) => {
				e.preventDefault()
				form.handleSubmit(
					async (formData) => {
						let result: Entry | null
						setIsFormLoading(true)

						try {
							if (!props.isEditForm) {
								result = await insertEntryMutation.mutateAsync(formData)
							} else if (props.data?.id !== undefined) {
								result = await updateEntryMutation.mutateAsync({
									id: props.data.id,
									...formData
								})
							} else {
								throw Error(
									"An unexpected error occured: No entry id referenced to update"
								)
							}

							if (!isNonNullable(result)) {
								throw Error(
									"An unexpected error occured: Inserted entry is null"
								)
							}

							toast.info(
								!props.isEditForm ? "New entry added" : "Entry updated",
								{ duration: SHORT_TOAST_DURATION }
							)

							form.reset()
							props.onSubmitSuccess?.(result, props.data)
						} catch (e) {
							const errorData = e as Error

							toast.error(errorData.message)
						} finally {
							setIsFormLoading(false)
						}
					},
					(errors) => {
						toast.error("Invalid data", {
							description: <ul>{getErrors(errors)}</ul>
						})
					}
				)()
			}}
		>
			<DialogHeader className="relative space-y-0 sm:text-center">
				{props.isEditForm && (
					<button
						type="button"
						disabled={isFormLoading}
						className="absolute block left-0 top-1/2 translate-y-[-50%]"
						onClick={() => form.reset()}
					>
						<ResetIcon
							className={`ml-2 h-4 w-4 ${isFormLoading && "text-muted"}`}
						/>
					</button>
				)}
				<DialogTitle className="leading-6" asChild>
					<h1 className="h-6 leading-6">
						{props.isEditForm ? "Edit Entry" : "New Entry"}
					</h1>
				</DialogTitle>
				<DialogClose className="absolute block right-0 top-1/2 translate-y-[-50%]">
					<X className="w-4 h-4" />
				</DialogClose>
				<DialogDescription>
					<VisuallyHidden>
						{props.isEditForm
							? "Fill in the information of the transaction to insert a new entry"
							: "Edit the information of the current transaction"}
					</VisuallyHidden>
				</DialogDescription>
			</DialogHeader>
			<div className="h-fit *:text-left grid gap-4">
				<Controller
					control={form.control}
					name="type"
					render={({ field, fieldState }) => (
						<EntryFormItem label="Type" fieldState={fieldState}>
							<div>
								<Tabs
									value={field.value}
									onValueChange={field.onChange}
									className="w-full"
								>
									<TabsList className="w-full relative">
										<TabsTrigger
											disabled={isFormLoading}
											className="peer/expense w-1/2 z-50
                                                data-[state=active]:bg-transparent
                                                "
											value="Expense"
										>
											Expense
										</TabsTrigger>
										<TabsTrigger
											disabled={isFormLoading}
											className="peer/income w-1/2 z-50
                                                data-[state=active]:bg-transparent
                                                "
											value="Income"
										>
											Income
										</TabsTrigger>
										<div
											className="
                                                items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 font-medium ring-offset-background transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-background 
                                                absolute top-1 left-1 w-[calc(50%-0.25rem)] h-[calc(100%-0.5rem)] peer-data-[state=active]/income:translate-x-full peer-data-[state=active]/expense:translate-x-0
                                                duration-300"
										></div>
									</TabsList>
								</Tabs>
							</div>
						</EntryFormItem>
					)}
				/>
				<Controller
					control={form.control}
					name="ledger"
					render={({ field, fieldState }) => (
						<EntryFormItem label="Ledger" fieldState={fieldState}>
							<Button
								type="button"
								variant="outline"
								disabled={
									ledgerQuery.isFetching ||
									!ledgerQuery.isFetched ||
									isFormLoading
								}
								className="w-full text-base justify-normal text-muted-foreground"
								onClick={props.onLedgerButton}
							>
								{ledgerQuery.isFetching || !ledgerQuery.isFetched ? (
									<ReloadIcon className="ml-2 h-4 w-4 animate-spin" />
								) : (
									getLedgerName(field.value)
								)}
								<ChevronRight className="w-4 h-4 ml-auto" />
							</Button>
						</EntryFormItem>
					)}
				/>
				<Controller
					control={form.control}
					name="date"
					render={({ field, fieldState }) => (
						<EntryFormItem label="Date" fieldState={fieldState}>
							<DatePicker
								required
								disabled={isFormLoading}
								onChange={field.onChange}
								value={field.value}
								closeOnSelect
							/>
						</EntryFormItem>
					)}
				/>
				<Controller
					control={form.control}
					name="category"
					render={({ field, fieldState }) => (
						<EntryFormItem label="Category" fieldState={fieldState}>
							<Button
								type="button"
								variant="outline"
								disabled={
									categoryQuery.isFetching ||
									!categoryQuery.isFetched ||
									isFormLoading
								}
								className="w-full text-base justify-normal text-muted-foreground"
								onClick={props.onCategoryButton}
							>
								{categoryQuery.isFetching || !categoryQuery.isFetched ? (
									<ReloadIcon className="ml-2 h-4 w-4 animate-spin" />
								) : (
									<>
										{field.value}
										<ChevronRight className="w-4 h-4 ml-auto" />
									</>
								)}
							</Button>
						</EntryFormItem>
					)}
				/>
				<Controller
					control={form.control}
					name="amount"
					render={({ field, fieldState }) => {
						const { onChange, ...rest } = field

						return (
							<EntryFormItem label="Amount" fieldState={fieldState}>
								<Input
									type="text"
									placeholder="Amount"
									inputMode="decimal"
									onChange={onChange}
									disabled={isFormLoading}
									{...rest}
								/>
							</EntryFormItem>
						)
					}}
				/>
				<Controller
					control={form.control}
					name="note"
					render={({ field, fieldState }) => (
						<EntryFormItem
							className="items-start [&_label]:h-10 [&_label]:align-middle [&_label]:leading-10"
							label="Notes"
							fieldState={fieldState}
						>
							<Textarea
								className="max-h-none h-36 sm:max-h-28 sm:h-auto webkit-textarea"
								disabled={isFormLoading}
								{...field}
							/>
						</EntryFormItem>
					)}
				/>
			</div>
			<DialogFooter className="h-fit gap-2">
				<Button disabled={isFormLoading}>
					Submit
					{isFormLoading && (
						<ReloadIcon className="ml-2 h-4 w-4 animate-spin" />
					)}
				</Button>
			</DialogFooter>
		</form>
	)
}
