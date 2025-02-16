import InputSkeleton from "@/app/(protected)/dashboard/settings/components/InputSkeleton"
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
import { Currency, Ledger } from "@/types/supabase"
import { zodResolver } from "@hookform/resolvers/zod"
import { ReloadIcon } from "@radix-ui/react-icons"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { ChevronLeft, X } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

export type LedgerFormData = Pick<Ledger, "id" | "currency_id" | "name">

export interface LedgerPageProps {
	data?: Ledger
	currencyList: Currency[]

	isLoading?: boolean
	isInitialized?: boolean

	onBackButton?: () => void
	onCreate?: (ledger: LedgerFormData) => Promise<void>
	onUpdate?: (ledger: LedgerFormData) => Promise<void>
}

const formSchema = z.object({
	name: z.string(),
	currency: z.object({
		id: z.number(),
		currency_name: z.string()
	})
})

export default function LedgerPage(props: LedgerPageProps) {
	const [isFormLoading, setIsFormLoading] = useState(props.isLoading ?? false)

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: props.data?.name,
			currency: {
				id: props.data?.currency_id,
				currency_name: props.data?.currency?.currency_name
			}
		}
	})

	useEffect(() => {
		setIsFormLoading(props.isLoading ?? false)
	}, [props.isLoading])

	useEffect(() => {
		if (!(props.isInitialized ?? true)) {
			return
		}

		if (props.data) {
			form.reset({
				name: props.data.name,
				currency: {
					id: props.data.currency_id,
					currency_name: props.data.currency?.currency_name ?? ""
				}
			})
			return
		}

		const defaultCurrency = props.currencyList[0]
		form.reset({
			name: "",
			currency: {
				id: defaultCurrency.id,
				currency_name: defaultCurrency.currency_name
			}
		})

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.currencyList, props.data])

	return (
		<div className="grid grid-rows-[auto_1fr]">
			<DialogHeader className="relative space-y-0 sm:text-center">
				<DialogTitle className="leading-6" asChild>
					<h2 className="h-6 leading-6">
						{props.data
							? `Edit ledger - ${props.data.name}`
							: "Create a new ledger"}
					</h2>
				</DialogTitle>
				{props.onBackButton && (
					<button
						className="absolute block left-0 top-1/2 translate-y-[-50%]"
						onClick={() => props.onBackButton?.()}
					>
						<ChevronLeft className="w-4 h-4" />
					</button>
				)}
				<DialogClose className="absolute block right-0 top-1/2 translate-y-[-50%]">
					<X className="w-4 h-4" />
				</DialogClose>
				<DialogDescription>
					<VisuallyHidden>
						{props.data ? "Edit the specified ledger" : "Create a new ledger"}
					</VisuallyHidden>
				</DialogDescription>
			</DialogHeader>
			<div className="flex flex-col h-full">
				<Form {...form}>
					<form
						className="h-full mt-4 grid grid-rows-[1fr_auto]"
						onSubmit={(e) => {
							e.preventDefault()
							form.handleSubmit(async (formData) => {
								setIsFormLoading(true)

								const isUpdate = props.data !== undefined
								const ledgerData: LedgerFormData = {
									id: props.data?.id ?? -1,
									name: formData.name,
									currency_id: formData.currency.id
								}

								if (isUpdate) {
									await props.onUpdate?.(ledgerData)
								} else {
									await props.onCreate?.(ledgerData)
								}

								setIsFormLoading(false)
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
											{props.isInitialized ?? true ? (
												<Input
													placeholder="Enter a new ledger name"
													disabled={isFormLoading}
													{...field}
												/>
											) : (
												<InputSkeleton />
											)}
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
											{props.isInitialized ?? true ? (
												<ComboBox
													closeOnSelect
													disabled={isFormLoading}
													value={field.value.currency_name}
													onChange={(e) => {
														form.setValue("currency", JSON.parse(e))
													}}
													values={
														props.currencyList.map((val) => ({
															label: val.currency_name,
															value: JSON.stringify(val)
														})) ?? []
													}
												/>
											) : (
												<InputSkeleton />
											)}
										</FormControl>
									</FormItem>
								)}
							/>
						</div>
						<DialogFooter>
							<Button
								disabled={!(props.isInitialized ?? true) || isFormLoading}
							>
								{props.data ? "Update ledger" : "Create new ledger"}
								{isFormLoading && (
									<ReloadIcon className="ml-2 h-4 w-4 relative animate-spin" />
								)}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</div>
		</div>
	)
}
