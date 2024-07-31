import { Drawer as VaulDrawer } from "vaul"
import { useMediaQuery } from "react-responsive"
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerDescription,
	DrawerTrigger,
	DrawerFooter,
	DrawerTitle,
	DrawerClose
} from "@/components/ui/drawer"
import { Button } from "../ui/button"
import { ScrollArea, ScrollBar } from "../ui/scroll-area"
import { z } from "zod"
import { FieldErrors, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form"
import { Input } from "../ui/input"
import DatePicker from "../ui/date-picker"
import ComboBox from "../ui/combobox"
import { Textarea } from "../ui/textarea"
import { sbBrowser } from "@/lib/supabase"
import { useToast } from "../ui/use-toast"
import { Entry } from "@/types/supabase"
import { useEffect, useMemo, useState } from "react"
import { useGlobalStore } from "@/lib/store"
import { PostgrestSingleResponse, User } from "@supabase/supabase-js"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogClose,
	DialogFooter,
	DialogTrigger
} from "../ui/dialog"

interface EntryFormProps {
	data?: Entry
	onSubmitSuccess?: (data: PostgrestSingleResponse<null>) => void
}

const formSchema = z.object({
	date: z.date(),
	title: z.string().min(1, "Please provide a title"),
	amount: z
		.preprocess((arg) => (arg === "" ? NaN : Number(arg)), z.coerce.string())
		.pipe(
			z.coerce
				.number()
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
		<FormItem className="mr-4 ml-1 grid grid-cols-[minmax(75px,30%)_1fr] items-center">
			<FormLabel>{props.label}</FormLabel>
			<FormControl>{props.children}</FormControl>
		</FormItem>
	)
}

function DrawerEntryForm(props: EntryFormProps) {
	const { toast } = useToast()
	const isEditForm = props.data !== undefined
	const queryClient = useQueryClient()
	const { data: userData } = useQuery({
		queryKey: ["user"],
		queryFn: () => sbBrowser.auth.getUser(),
		refetchOnMount: false
	})

	const insertMutation = useMutation({
		mutationFn: (formData: z.infer<typeof formSchema>) => {
			const isPositive = formData.type === "Income"

			return Promise.resolve(
				sbBrowser.from("entry").insert({
					date: formData.date.toLocaleDateString(),
					title: formData.title,
					created_by: userData?.data.user?.id,
					amount_is_positive: isPositive,
					amount: Number(formData.amount),
					note: formData.notes
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

			return Promise.resolve(
				sbBrowser
					.from("entry")
					.update({
						date: formData.date.toLocaleDateString(),
						title: formData.title,
						amount_is_positive: isPositive,
						amount: Number(formData.amount),
						note: formData.notes
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

			defaultValues.date = new Date(props.data?.date as string)
			defaultValues.title = props.data?.title as string
			defaultValues.type = props.data?.amount_is_positive ? "Income" : "Expense"
			defaultValues.amount = props.data?.amount?.toFixed(2) as string
			defaultValues.notes = (props.data?.note ?? "") as string

			return defaultValues
		}, [props, isEditForm])
	})

	return (
		<DrawerContent>
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
												description: "New entry added"
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
												description: "Entry updated"
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
					<DrawerHeader>
						<DrawerTitle asChild>
							<h1>{props.data !== undefined ? "Edit Entry" : "New Entry"}</h1>
						</DrawerTitle>
						<DrawerDescription asChild>
							<ScrollArea className="h-72 w-full overflow-x-visible fixed bottom-0 left-0">
								<div className="*:text-left space-y-2">
									<FormField
										control={form.control}
										name="type"
										render={({ field }) => (
											<EntryFormItem label="Type">
												<div>
													<ComboBox
														closeOnSelect
														value={field.value}
														onChange={(e) => {
															form.setValue("type", e as any)
														}}
														values={[
															{ label: "Income", value: "Income" },
															{ label: "Expense", value: "Expense" }
														]}
													/>
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
												<VaulDrawer.NestedRoot>
													<DrawerTrigger asChild>
														<Button
															type="button"
															variant="secondary"
															className="w-1/2 self-start"
														>
															Add notes
														</Button>
													</DrawerTrigger>
													<DrawerContent className="z-[130]">
														<DrawerHeader>
															<DrawerTitle>Notes</DrawerTitle>
														</DrawerHeader>
														<DrawerDescription className="px-2">
															<Textarea
																data-vaul-no-drag
																className="h-96"
																{...field}
															/>
														</DrawerDescription>
														<DrawerFooter>
															<DrawerClose asChild>
																<Button type="button">Close</Button>
															</DrawerClose>
														</DrawerFooter>
													</DrawerContent>
												</VaulDrawer.NestedRoot>
											</EntryFormItem>
										)}
									/>
								</div>
								<ScrollBar />
							</ScrollArea>
						</DrawerDescription>
					</DrawerHeader>
					<DrawerFooter>
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
						<DrawerClose asChild>
							<Button type="button" variant="outline">
								Cancel
							</Button>
						</DrawerClose>
					</DrawerFooter>
				</form>
			</Form>
		</DrawerContent>
	)
}

function DialogEntryForm(props: EntryFormProps) {
	const { toast } = useToast()
	const isEditForm = props.data !== undefined
	const queryClient = useQueryClient()
	const { data: userData } = useQuery({
		queryKey: ["user"],
		queryFn: () => sbBrowser.auth.getUser(),
		refetchOnMount: false
	})

	const insertMutation = useMutation({
		mutationFn: (formData: z.infer<typeof formSchema>) => {
			const isPositive = formData.type === "Income"

			return Promise.resolve(
				sbBrowser.from("entry").insert({
					date: formData.date.toLocaleDateString(),
					title: formData.title,
					created_by: userData?.data.user?.id,
					amount_is_positive: isPositive,
					amount: Number(formData.amount),
					note: formData.notes
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

			return Promise.resolve(
				sbBrowser
					.from("entry")
					.update({
						date: formData.date.toLocaleDateString(),
						title: formData.title,
						amount_is_positive: isPositive,
						amount: Number(formData.amount),
						note: formData.notes
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

			defaultValues.date = new Date(props.data?.date as string)
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
												description: "New entry added"
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
												description: "Entry updated"
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
							<ScrollArea className="h-72 w-full overflow-x-visible fixed bottom-0 left-0">
								<div className="*:text-left space-y-2">
									<FormField
										control={form.control}
										name="type"
										render={({ field }) => (
											<EntryFormItem label="Type">
												<div>
													<ComboBox
														closeOnSelect
														value={field.value}
														onChange={(e) => {
															form.setValue("type", e as any)
														}}
														values={[
															{ label: "Income", value: "Income" },
															{ label: "Expense", value: "Expense" }
														]}
													/>
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
															variant="secondary"
															className="w-1/2 self-start"
														>
															Add notes
														</Button>
													</DialogTrigger>
													<DialogContent className="z-[130]">
														<DialogHeader>
															<DialogTitle>Notes</DialogTitle>
														</DialogHeader>
														<DialogDescription className="px-2">
															<Textarea
																data-vaul-no-drag
																className="h-96"
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
								<ScrollBar />
							</ScrollArea>
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
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
						<DialogClose asChild>
							<Button type="button" variant="outline">
								Cancel
							</Button>
						</DialogClose>
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

	if (isDesktop) {
		return <DialogEntryForm {...props} />
	}

	return <DrawerEntryForm {...props} />
}
