import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import {
	DialogClose,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog"
import { Form, FormField } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useUserQuery } from "@/lib/hooks"
import { sbBrowser } from "@/lib/supabase"
import { Entry } from "@/types/supabase"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { PostgrestSingleResponse } from "@supabase/supabase-js"
import { useMutation } from "@tanstack/react-query"
import { ChevronRight, X } from "lucide-react"
import { FieldErrors, useForm } from "react-hook-form"
import { EntryFormContext, EntryFormItem, FormSchema } from "./EntryForm"
import { useContext } from "react"
import { format } from "path"

interface EntryFormPageProps {
	data?: Entry
	form: ReturnType<typeof useForm<FormSchema>>
	isEditForm: boolean
	onSubmitSuccess?: (data: PostgrestSingleResponse<null>) => void
}

const getErrors = (errors: FieldErrors<FormSchema>) => {
	const result = []
	result.push(<li>{errors?.date?.message}</li>)
	result.push(<li>{errors?.category?.message}</li>)
	result.push(<li>{errors?.amount?.message}</li>)
	result.push(<li>{errors?.type?.message}</li>)
	result.push(<li>{errors?.note?.message}</li>)
	return result
}

export default function EntryFormPage(props: EntryFormPageProps) {
	const { toast } = useToast()
	const { setCurPage } = useContext(EntryFormContext)
	const userData = useUserQuery()

	const insertMutation = useMutation({
		mutationFn: (formData: FormSchema) => {
			const isPositive = formData.type === "Income"
			let note: string | null = formData.note
			if (note === "") {
				note = null
			}

			return Promise.resolve(
				sbBrowser.from("entry").insert({
					date: formData.date.toLocaleDateString(),
					category_id: formData.category.id,
					created_by: userData.data?.data.user?.id as string,
					is_positive: isPositive,
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

			let note: string | null = formData.note
			if (note === "") {
				note = null
			}

			return Promise.resolve(
				sbBrowser
					.from("entry")
					.update({
						date: formData.date.toDateString(),
						category_id: formData.category.id,
						is_positive: isPositive,
						amount: Number(formData.amount),
						note: note
					})
					.eq("id", props.data.id)
			)
		}
	})

	return (
		<Form {...props.form}>
			<form
				className="grid grid-rows-[1.5rem_1fr_auto] h-full"
				onSubmit={(e) => {
					e.preventDefault()
					props.form.handleSubmit(
						async (formData) => {
							let result

							if (!props.isEditForm) {
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

										props.form.reset()
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
					<DialogTitle className="leading-6" asChild>
						<h1 className="h-6 leading-6">
							{props.data !== undefined ? "Edit Entry" : "New Entry"}
						</h1>
					</DialogTitle>
					<DialogClose
						className="absolute block right-0 top-1/2 translate-y-[-50%]
                            rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
					>
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

				<div className="h-fit mt-8 sm:mt-2 *:text-left">
					<FormField
						control={props.form.control}
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
						control={props.form.control}
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
					<div className="h-10 my-4 grid grid-cols-[minmax(75px,30%)_1fr] items-center">
						<span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
							Category
						</span>
						<Button
							type="button"
							variant="outline"
							className="w-full justify-normal text-muted-foreground"
							onClick={() => setCurPage(1)}
						>
							{props.form.getValues("category.name")}
							<ChevronRight className="w-4 h-4 ml-auto" />
						</Button>
					</div>
					<FormField
						control={props.form.control}
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
						control={props.form.control}
						name="note"
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
					{props.isEditForm && (
						<Button
							variant="secondary"
							type="button"
							onClick={() => props.form.reset()}
						>
							Reset
						</Button>
					)}
				</DialogFooter>
			</form>
		</Form>
	)
}
