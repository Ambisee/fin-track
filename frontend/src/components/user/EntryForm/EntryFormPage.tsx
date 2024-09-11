import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import {
	DialogClose,
	DialogDescription,
	DialogFooter,
	DialogHeader
} from "@/components/ui/dialog"
import { Form, FormField } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Entry } from "@/types/supabase"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { PostgrestSingleResponse } from "@supabase/supabase-js"
import { useMutation } from "@tanstack/react-query"
import { X } from "lucide-react"
import { FieldErrors, useForm } from "react-hook-form"
import { EntryFormItem, FormSchema } from "./EntryForm"

interface EntryFormPageProps {
	data?: Entry
	form: ReturnType<typeof useForm<FormSchema>>
	isEditForm: boolean
	insertMutation: ReturnType<
		typeof useMutation<PostgrestSingleResponse<null>, Error, FormSchema>
	>
	updateMutation: ReturnType<
		typeof useMutation<PostgrestSingleResponse<null>, Error, FormSchema>
	>
	onSubmitSuccess?: (data: PostgrestSingleResponse<null>) => void
}

const getErrors = (
	errors: FieldErrors<{
		date: Date
		title: string
		amount: number
		type: "Income" | "Expense"
		notes: string
	}>
) => {
	const result = []
	result.push(<li>{errors?.date?.message}</li>)
	result.push(<li>{errors?.title?.message}</li>)
	result.push(<li>{errors?.amount?.message}</li>)
	result.push(<li>{errors?.type?.message}</li>)
	result.push(<li>{errors?.notes?.message}</li>)
	return result
}

export default function EntryFormPage(props: EntryFormPageProps) {
	const { form, insertMutation, updateMutation, data, isEditForm } = props
	const { toast } = useToast()

	return (
		<Form {...form}>
			<form
				className="grid grid-rows-[1.5rem_1fr_auto] h-full"
				onSubmit={(e) => {
					e.preventDefault()
					form.handleSubmit(
						async (formData) => {
							let result

							if (!isEditForm) {
								result = insertMutation.mutate(formData, {
									onSuccess: (data) => {
										if (data.error !== null) {
											toast({
												description: data.error.message,
												variant: "destructive"
											})
										}

										toast({
											description: "New entry added",
											duration: 1500
										})

										form.reset()
										props.onSubmitSuccess?.(data)
									}
								})
							} else {
								result = updateMutation.mutate(formData, {
									onSuccess: (data) => {
										if (data.error !== null) {
											toast({
												description: data.error.message,
												variant: "destructive"
											})
										}

										toast({
											description: "Entry updated",
											duration: 1500
										})

										props.onSubmitSuccess?.(data)
									}
								})
							}
						},
						(errors) => {
							toast({
								title: "Invalid data",
								description: <ul>{getErrors(errors)}</ul>,
								variant: "destructive"
							})
						}
					)()
				}}
			>
				<DialogHeader className="relative space-y-0 sm:text-center">
					<h1 className="h-6 leading-6">
						{props.data !== undefined ? "Edit Entry" : "New Entry"}
					</h1>
					<DialogClose
						className="absolute block left-0 top-1/2 translate-y-[-50%]
                            rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
					>
						<X className="w-4 h-4" />
					</DialogClose>
				</DialogHeader>

				<DialogDescription>
					<VisuallyHidden>
						A dialog element which displays a form to insert or edit an entry.
					</VisuallyHidden>
				</DialogDescription>

				<div className="h-fit mt-8 sm:mt-2 *:text-left">
					<FormField
						control={form.control}
						name="type"
						render={({ field }) => (
							<EntryFormItem label="Type">
								<div>
									<Tabs
										value={field.value}
										onValueChange={field.onChange}
										className="w-full"
									>
										<TabsList className="w-full">
											<TabsTrigger className="w-1/2" value="Income">
												Income
											</TabsTrigger>
											<TabsTrigger className="w-1/2" value="Expense">
												Expense
											</TabsTrigger>
										</TabsList>
									</Tabs>
								</div>
							</EntryFormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="date"
						render={({ field }) => (
							<EntryFormItem label="Date">
								<DatePicker
									onChange={field.onChange}
									value={field.value}
									closeOnSelect
								/>
							</EntryFormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="title"
						render={({ field }) => (
							<EntryFormItem label="Title">
								<Input placeholder="Title" {...field} />
							</EntryFormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="amount"
						render={({ field }) => {
							const { onChange, ...rest } = field

							return (
								<EntryFormItem label="Amount">
									<Input
										type="text"
										placeholder="Amount"
										inputMode="decimal"
										onChange={onChange}
										{...rest}
									/>
								</EntryFormItem>
							)
						}}
					/>
					<FormField
						control={form.control}
						name="notes"
						render={({ field }) => (
							<EntryFormItem
								className="items-start [&_label]:h-10 [&_label]:align-middle [&_label]:leading-10"
								label="Notes"
							>
								<Textarea
									className="max-h-none h-36 sm:max-h-28 sm:h-auto"
									{...field}
								/>
							</EntryFormItem>
						)}
					/>
				</div>

				<DialogFooter className="h-fit gap-2">
					<Button>Submit</Button>
					{isEditForm && (
						<Button
							variant="secondary"
							type="button"
							onClick={() => form.reset()}
						>
							Reset
						</Button>
					)}
				</DialogFooter>
			</form>
		</Form>
	)
}
