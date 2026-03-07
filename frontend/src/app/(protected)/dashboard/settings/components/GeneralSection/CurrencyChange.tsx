import ComboBox from "@/components/ui/combobox"
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel
} from "@/components/ui/field"
import InputSkeleton from "../InputSkeleton"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCurrenciesQuery, useSettingsQuery, useUserQuery } from "@/lib/hooks"
import { toast } from "sonner"
import { sbBrowser } from "@/lib/supabase"
import { useCallback, useEffect, useState } from "react"
import {
	SHORT_TOAST_DURATION,
	USER_QKEY,
	USER_SETTINGS_QKEY
} from "@/lib/constants"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { ReloadIcon } from "@radix-ui/react-icons"

const formSchema = z.object({
	currency: z.object({
		id: z.number(),
		currency_name: z.string()
	})
})

export default function CurrencyChange() {
	const [isPendingSubmit, setIsPendingSubmit] = useState(false)

	const queryClient = useQueryClient()
	const userQuery = useUserQuery()
	const settingsQuery = useSettingsQuery()
	const currenciesQuery = useCurrenciesQuery()

	const currencies = currenciesQuery.data
	const userSettings = settingsQuery.data
	const formDefaultValues = useCallback(
		() => ({
			currency: {
				id: userSettings?.ledger?.currency_id,
				currency_name: userSettings?.ledger?.currency?.currency_name
			}
		}),
		[userSettings]
	)

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: formDefaultValues()
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

		const { data: result, error } = await sbBrowser
			.from("ledger")
			.update({ currency_id: data.currency.id })
			.eq("id", userSettings.current_ledger)
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
				<b>{data.currency.currency_name}</b>
			</>,
			{ duration: SHORT_TOAST_DURATION }
		)
	}

	useEffect(() => {
		form.reset(formDefaultValues())
	}, [form, formDefaultValues])

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
							{!field.value.id ? (
								<InputSkeleton />
							) : (
								<ComboBox
									closeOnSelect
									value={field.value.currency_name}
									onChange={(e) => {
										form.setValue(field.name, JSON.parse(e))
									}}
									values={
										currencies?.map((val) => ({
											label: val.currency_name,
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
