import { Button } from "@/components/ui/button"
import ComboBox from "@/components/ui/combobox"
import {
	DialogClose,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog"
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useDialogPages } from "@/components/user/DialogPagesProvider"
import { LEDGER_QKEY, USER_SETTINGS_QKEY } from "@/lib/constants"
import {
	useCurrenciesQuery,
	useLedgersQuery,
	useSettingsQuery,
	useUserQuery
} from "@/lib/hooks"
import { sbBrowser } from "@/lib/supabase"
import { zodResolver } from "@hookform/resolvers/zod"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ChevronLeft, X } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import InputSkeleton from "../InputSkeleton"
import { useLedgerToEdit } from "./LedgerProvider"

interface LedgerPageProps {}

const formSchema = z.object({
	name: z.string(),
	currency: z.object({
		id: z.number(),
		currency_name: z.string()
	})
})

export default function LedgerPage(props: LedgerPageProps) {
	const [isFormLoading, setIsFormLoading] = useState(false)

	const { toast } = useToast()
	const { setCurPage } = useDialogPages()
	const { ledgerToEdit } = useLedgerToEdit()
	const queryClient = useQueryClient()

	const userQuery = useUserQuery()
	const settingsQuery = useSettingsQuery()
	const ledgersQuery = useLedgersQuery()
	const currenciesQuery = useCurrenciesQuery()

	const settingsData = settingsQuery.data?.data
	const formDefaultValues = () => {
		let name = ""
		let currency = { id: 1, currency_name: "USD" }

		if (settingsData !== null && settingsData !== undefined) {
			currency = {
				id: settingsData.default_currency,
				currency_name: settingsData.currency!.currency_name
			}
		}

		if (ledgerToEdit !== undefined) {
			name = ledgerToEdit.name
			currency = {
				id: ledgerToEdit.currency_id,
				currency_name: ledgerToEdit.currency!.currency_name
			}
		}

		return {
			name,
			currency
		}
	}

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: formDefaultValues()
	})

	const updateLedgerMutation = useMutation({
		mutationKey: LEDGER_QKEY,
		mutationFn: async (data: z.infer<typeof formSchema>) => {
			if (!userQuery.data?.data || !userQuery.data.data.user || !ledgerToEdit) {
				return null
			}

			const result = await sbBrowser
				.from("ledger")
				.update({ name: data.name, currency_id: data.currency.id })
				.eq("name", ledgerToEdit.name)
				.eq("created_by", ledgerToEdit.created_by)
				.select()

			return result
		}
	})

	const insertLedgerMutation = useMutation({
		mutationKey: LEDGER_QKEY,
		mutationFn: async (data: z.infer<typeof formSchema>) => {
			if (!userQuery.data?.data || !userQuery.data.data.user) {
				return null
			}

			const result = await sbBrowser
				.from("ledger")
				.insert({
					created_by: userQuery.data.data.user.id,
					name: data.name,
					currency_id: data.currency.id
				})
				.select()

			return result
		}
	})

	return (
		<div className="grid grid-rows-[auto_1fr]">
			<DialogHeader className="relative space-y-0 sm:text-center">
				<DialogTitle className="leading-6" asChild>
					<h1 className="h-6 leading-6">
						{ledgerToEdit
							? `Edit ledger - ${ledgerToEdit.name}`
							: "Create a new ledger"}
					</h1>
				</DialogTitle>
				<button
					className="absolute block left-0 top-1/2 translate-y-[-50%]"
					onClick={() => setCurPage((c) => c - 1)}
				>
					<ChevronLeft className="w-4 h-4" />
				</button>
				<DialogClose className="absolute block right-0 top-1/2 translate-y-[-50%]">
					<X className="w-4 h-4" />
				</DialogClose>
				<DialogDescription>
					<VisuallyHidden>
						{ledgerToEdit ? "Edit the specified ledger" : "Create a new ledger"}
					</VisuallyHidden>
				</DialogDescription>
			</DialogHeader>
			<div className="flex flex-col h-full">
				<Form {...form}>
					<form
						className="h-full mt-4 grid grid-rows-[1fr_auto]"
						onSubmit={(e) => {
							e.preventDefault()
							form.handleSubmit((formData) => {
								setIsFormLoading(true)
								if (!userQuery.data?.data) {
									return
								}

								if (!ledgersQuery.data?.data) {
									toast({
										description:
											"The ledger name has been used. Please enter a different name.",
										variant: "destructive"
									})
									setIsFormLoading(false)
									return
								}

								const isUpdate = ledgerToEdit !== undefined
								const mutation = isUpdate
									? updateLedgerMutation
									: insertLedgerMutation

								mutation.mutate(
									{ name: formData.name, currency: formData.currency },
									{
										onSuccess: (successData) => {
											if (!successData) return
											if (successData?.error?.code === "23505") {
												toast({
													description:
														"The ledger name has been used. Please enter another one",
													variant: "destructive"
												})
												setIsFormLoading(false)
												return
											}

											toast({
												description: isUpdate
													? "Ledger updated"
													: "New ledger created"
											})

											setCurPage(0)
											setIsFormLoading(false)
											queryClient.invalidateQueries({ queryKey: LEDGER_QKEY })
											queryClient.invalidateQueries({
												queryKey: USER_SETTINGS_QKEY
											})
										}
									}
								)
							})()
						}}
					>
						<div>
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem className="mt-2">
										<FormLabel>Ledger Name</FormLabel>
										<FormControl>
											<Input placeholder="Enter a new ledger name" {...field} />
										</FormControl>
										<FormDescription>
											Please note that no two ledgers can share the same name.
										</FormDescription>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="currency"
								render={({ field }) => (
									<FormItem className="grid mt-8">
										<FormLabel className="text-sm">Currency</FormLabel>
										<FormControl>
											{userQuery.isLoading || currenciesQuery.isLoading ? (
												<InputSkeleton />
											) : (
												<ComboBox
													closeOnSelect
													value={field.value.currency_name}
													onChange={(e) => {
														form.setValue("currency", JSON.parse(e))
													}}
													values={
														currenciesQuery.data?.data?.map((val) => ({
															label: val.currency_name,
															value: JSON.stringify(val)
														})) ?? []
													}
												/>
											)}
										</FormControl>
									</FormItem>
								)}
							/>
						</div>
						<DialogFooter>
							<Button>
								{!ledgerToEdit ? "Create new ledger" : "Update ledger"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</div>
		</div>
	)
}