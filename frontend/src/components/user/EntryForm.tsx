"use client"

import { CATEGORIES_QKEY, USER_QKEY } from "@/lib/constants"
import { sbBrowser } from "@/lib/supabase"
import { Entry } from "@/types/supabase"
import { zodResolver } from "@hookform/resolvers/zod"
import { PostgrestSingleResponse } from "@supabase/supabase-js"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { FieldErrors, useForm } from "react-hook-form"
import { useMediaQuery } from "react-responsive"
import { z } from "zod"
import { Button } from "../ui/button"
import DatePicker from "../ui/date-picker"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from "../ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form"
import { Input } from "../ui/input"
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"
import { Textarea } from "../ui/textarea"
import { useToast } from "../ui/use-toast"

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

function EntryFormItem(props: { label: string; children: JSX.Element }) {
	return (
		<FormItem className="my-2 mr-4 ml-1 grid grid-cols-[minmax(75px,30%)_1fr] items-center">
			<FormLabel>{props.label}</FormLabel>
			<FormControl>{props.children}</FormControl>
		</FormItem>
	)
}

function DialogEntryForm(props: EntryFormProps) {
	const { toast } = useToast()
	const isEditForm = props.data !== undefined
	const { data: userData } = useQuery({
		queryKey: USER_QKEY,
		queryFn: () => sbBrowser.auth.getUser(),
		refetchOnWindowFocus: false,
		refetchOnMount: (query) => {
			return query.state.data === undefined
		}
	})

	const { data: categoriesData } = useQuery({
		queryKey: CATEGORIES_QKEY,
		queryFn: async () => {
			return await sbBrowser.rpc("fetch_categories", {
				user_id: userData?.data.user?.id as string
			})
		},
		enabled: !!userData
	})

	const insertMutation = useMutation({
		mutationFn: (formData: z.infer<typeof formSchema>) => {
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
		mutationFn: (formData: z.infer<typeof formSchema>) => {
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

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: useMemo(() => {
			let defaultValues: z.infer<typeof formSchema> = {
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
		<DialogContent>
			<Form {...form}>
				<form
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
					<DialogHeader>
						<DialogTitle asChild>
							<h1>{props.data !== undefined ? "Edit Entry" : "New Entry"}</h1>
						</DialogTitle>
						<DialogDescription asChild>
							<div className="*:text-left space-y-2">
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
										<EntryFormItem label="Notes">
											<Dialog>
												<DialogTrigger asChild>
													<Button
														type="button"
														variant="default"
														className="w-24 self-start"
													>
														Open
													</Button>
												</DialogTrigger>
												<DialogContent className="z-[130]">
													<DialogHeader>
														<DialogTitle>Notes</DialogTitle>
													</DialogHeader>
													<DialogDescription className="px-2">
														<Textarea
															data-vaul-no-drag
															className="min-h-28 max-h-96"
															{...field}
														/>
													</DialogDescription>
													<DialogFooter>
														<DialogClose asChild>
															<Button type="button">Close</Button>
														</DialogClose>
													</DialogFooter>
												</DialogContent>
											</Dialog>
										</EntryFormItem>
									)}
								/>
							</div>
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="mt-8 gap-2 md:gap-0">
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
		</DialogContent>
	)
}

export default function EntryForm(props: EntryFormProps) {
	const isDesktop = useMediaQuery({
		minWidth: 768
	})

	return <DialogEntryForm {...props} />
}
