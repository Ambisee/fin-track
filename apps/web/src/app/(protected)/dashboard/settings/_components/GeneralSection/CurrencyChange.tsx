import { Button } from "@/components/ui/button"
import ComboBox from "@/components/ui/combobox"
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel
} from "@/components/ui/field"
import InputSkeleton from "@/components/user/InputSkeleton"
import {
	SHORT_TOAST_DURATION,
	USER_QKEY,
	USER_SETTINGS_QKEY
} from "@/lib/constants"
import {
	useCurrenciesQuery,
	useSettingsQuery,
	useUserQuery
} from "@/lib/queries"
import { supabaseClient } from "@/lib/supabase"
import { isNonNullable } from "@fintrack/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { ReloadIcon } from "@radix-ui/react-icons"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

const formSchema = z.object({
	currency: z.object({
		id: z.number(),
		name: z.string()
	})
})

type CurrencyFormSchema = z.infer<typeof formSchema>

export default function CurrencyChange() {
	const [isPendingSubmit, setIsPendingSubmit] = useState(false)
	const [supabase] = useState(supabaseClient())

	const queryClient = useQueryClient()
	const userQuery = useUserQuery()
	const settingsQuery = useSettingsQuery()
	const currenciesQuery = useCurrenciesQuery()

	const currencies = currenciesQuery.data
	const userSettings = settingsQuery.data

	const form = useForm<CurrencyFormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			currency: {
				id: -1,
				name: ""
			}
		}
	})

	const onFormSubmit: Parameters<typeof form.handleSubmit>["0"] = async (
		data
	) => {
		setIsPendingSubmit(true)
		if (!userSettings) {
			toast.error("User information unavailable. Please try again later")
			setIsPendingSubmit(false)
			return
		}

		const { data: result, error } = await supabase
			.from("ledger")
			.update({ currency_id: data.currency.id })
			.eq("id", userSettings.visibleLedger.id)
			.select()
			.single()

		if (error !== null) {
			toast.error(error.message, { duration: SHORT_TOAST_DURATION })
			setIsPendingSubmit(false)
			return
		}

		queryClient.invalidateQueries({ queryKey: USER_QKEY })
		queryClient
			.invalidateQueries({ queryKey: USER_SETTINGS_QKEY })
			.then(() => form.reset())
		setIsPendingSubmit(false)

		toast.info(
			<>
				The currency for the ledger <b>{result.name}</b> has been switched to{" "}
				<b>{data.currency.name}</b>
			</>,
			{ duration: SHORT_TOAST_DURATION }
		)
	}

	const settingsLedgerCurrency = settingsQuery.data?.visibleLedger?.currency
	useEffect(() => {
		const defaultValues: CurrencyFormSchema = {
			currency: {
				id: -1,
				name: ""
			}
		}

		if (!isNonNullable(settingsLedgerCurrency)) {
			form.reset(defaultValues)
			return
		}

		defaultValues.currency = settingsLedgerCurrency
		form.reset(defaultValues)
	}, [form, settingsLedgerCurrency])

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault()
				form.handleSubmit(onFormSubmit)()
			}}
		>
			<FieldGroup>
				<Controller
					control={form.control}
					name="currency"
					render={({ field, fieldState }) => (
						<Field className="mt-8" data-invalid={fieldState.invalid}>
							<FieldLabel className="text-sm">Currency</FieldLabel>
							<FieldDescription>
								Change the currency for the current ledger.
							</FieldDescription>
							{field.value.id === -1 ? (
								<InputSkeleton />
							) : (
								<ComboBox
									closeOnSelect
									value={field.value.name}
									onChange={(e) => {
										form.setValue(field.name, JSON.parse(e))
									}}
									values={
										currencies?.map((val) => ({
											label: val.name,
											value: JSON.stringify(val)
										})) ?? []
									}
								/>
							)}
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
				/>
			</FieldGroup>
			<Button
				className="mt-6"
				variant="default"
				disabled={userQuery.isLoading || isPendingSubmit}
			>
				Save Settings
				{isPendingSubmit && (
					<ReloadIcon className="ml-2 h-4 w-4 animate-spin" />
				)}
			</Button>
		</form>
	)
}
