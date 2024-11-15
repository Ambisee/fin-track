import ComboBox from "@/components/ui/combobox"
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel
} from "@/components/ui/form"
import InputSkeleton from "../InputSkeleton"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCurrenciesQuery, useSettingsQuery, useUserQuery } from "@/lib/hooks"
import { toast } from "@/components/ui/use-toast"
import { sbBrowser } from "@/lib/supabase"
import { useState } from "react"
import { USER_QKEY, USER_SETTINGS_QKEY } from "@/lib/constants"
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

	const currencies = currenciesQuery.data?.data
	const userSettings = settingsQuery.data?.data

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			currency: {
				id: userSettings?.default_currency ?? 1,
				currency_name: userSettings?.currency?.currency_name ?? "USD"
			}
		}
	})

	return (
		<Form {...form}>
			<form
				onSubmit={(e) => {
					e.preventDefault()
					form.handleSubmit(async (data) => {
						if (
							currencies === null ||
							currencies === undefined ||
							userSettings?.currency?.currency_name === undefined ||
							userSettings.default_currency === data.currency.id
						) {
							toast({
								description: "Unable to fetch currency data",
								variant: "destructive",
								duration: 1500
							})
							return
						}

						if (data.currency === undefined) {
							toast({
								description: "Invalid currency value provided",
								variant: "destructive",
								duration: 1500
							})
							setIsPendingSubmit(false)

							return
						}

						const { error } = await sbBrowser
							.from("settings")
							.update({ default_currency: data.currency.id })
							.eq("user_id", userSettings?.user_id as string)

						if (error !== null) {
							toast({
								description: error.message,
								variant: "destructive",
								duration: 1500
							})
							setIsPendingSubmit(false)
							return
						}

						queryClient.invalidateQueries({ queryKey: USER_QKEY })
						queryClient
							.invalidateQueries({ queryKey: USER_SETTINGS_QKEY })
							.then(() => form.reset())
						setIsPendingSubmit(false)

						toast({
							description: "Currency updated",
							duration: 1500
						})
					})()
				}}
			>
				<FormField
					control={form.control}
					name="currency"
					render={({ field }) => (
						<FormItem className="grid mt-8">
							<FormLabel className="text-sm">Default Currency</FormLabel>
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
											currencies?.map((val) => ({
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
		</Form>
	)
}
