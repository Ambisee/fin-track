import { Button } from "@/components/ui/button"
import ComboBox from "@/components/ui/combobox"
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import {
	MAX_USERNAME_LENGTH,
	USER_QKEY,
	USER_SETTINGS_QKEY
} from "@/lib/constants"
import { useCurrenciesQuery, useSettingsQuery, useUserQuery } from "@/lib/hooks"
import { sbBrowser } from "@/lib/supabase"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import InputSkeleton from "../InputSkeleton"
import SettingsSection from "../SettingsSection"
import { ReloadIcon } from "@radix-ui/react-icons"
import { Label } from "@/components/ui/label"
import CategoriesEditor from "./CategoriesEditor"

const generalSectionFormSchema = z.object({
	username: z
		.string()
		.max(
			MAX_USERNAME_LENGTH,
			`Must be at most ${MAX_USERNAME_LENGTH} characters`
		)
		.regex(/(^$)|(^[a-zA-Z0-9]+$)/, "Must only contain alphanumeric characters")
		.default(""),
	default_currency: z.string()
})

export default function GeneralSection() {
	const { toast } = useToast()
	const [isPendingSubmit, setIsPendingSubmit] = useState(false)
	const queryClient = useQueryClient()
	const userQuery = useUserQuery()

	const currenciesQuery = useCurrenciesQuery()
	const currencies = currenciesQuery.data?.data

	const userSettingsQuery = useSettingsQuery()
	const userSettings = userSettingsQuery.data?.data

	const form = useForm<z.infer<typeof generalSectionFormSchema>>({
		resolver: zodResolver(generalSectionFormSchema),
		values: {
			username: "",
			default_currency:
				userSettingsQuery.data?.data?.currency?.currency_name ?? "USD"
		}
	})

	return (
		<SettingsSection name="General">
			<Form {...form}>
				<form
					onSubmit={(e) => {
						e.preventDefault()
						form.handleSubmit(
							async (data) => {
								setIsPendingSubmit(true)
								if (data.username !== "") {
									const { error } = await sbBrowser.auth.updateUser({
										data: {
											username: data.username
										}
									})

									if (error !== null) {
										toast({
											title: error.message,
											variant: "destructive",
											duration: 1500
										})
										setIsPendingSubmit(false)

										return
									}
								}

								if (
									currencies !== null &&
									currencies !== undefined &&
									userSettings?.currency?.currency_name !== undefined &&
									userSettings.currency.currency_name !== data.default_currency
								) {
									const newCurrencyId = currencies.find(
										(value) => value.currency_name === data.default_currency
									)
									if (newCurrencyId === undefined) {
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
										.update({ default_currency: newCurrencyId.id })
										.eq("user_id", userSettings.user_id)

									if (error !== null) {
										toast({
											description: error.message,
											variant: "destructive",
											duration: 1500
										})
										setIsPendingSubmit(false)
										return
									}
								}

								queryClient.invalidateQueries({ queryKey: USER_QKEY })
								queryClient.invalidateQueries({ queryKey: USER_SETTINGS_QKEY })
								form.resetField("username")
								setIsPendingSubmit(false)

								toast({
									description: "User settings updated",
									duration: 1500
								})
							},
							(errors) => {}
						)()
					}}
				>
					<FormField
						control={form.control}
						name="username"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Username</FormLabel>
								<FormControl>
									{userQuery.isLoading ? (
										<InputSkeleton />
									) : (
										<Input
											className="w-full"
											placeholder={
												userQuery.data?.data.user?.user_metadata["username"]
											}
											{...field}
										/>
									)}
								</FormControl>
								{form.formState.errors.username?.message && (
									<div className="min-h-5 min-w-1 text-sm font-medium text-destructive">
										{form.formState.errors.username.message}
									</div>
								)}
								{userQuery.isLoading ? (
									<Skeleton className="h-6 w-full max-w-40" />
								) : (
									<FormDescription>
										Usernames must only contain alphanumeric characters and at
										most {MAX_USERNAME_LENGTH} characters
									</FormDescription>
								)}
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="default_currency"
						render={({ field }) => (
							<FormItem className="grid mt-8">
								<FormLabel>Default Currency</FormLabel>
								<FormControl>
									{userQuery.isLoading ? (
										<InputSkeleton />
									) : (
										<ComboBox
											closeOnSelect
											value={field.value}
											onChange={(e) => {
												form.setValue("default_currency", e)
											}}
											values={
												currencies?.map((val) => ({
													label: val.currency_name,
													value: val.currency_name
												})) ?? []
											}
										/>
									)}
								</FormControl>
							</FormItem>
						)}
					/>
					<div className="grid mt-8">
						<CategoriesEditor />
					</div>
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
		</SettingsSection>
	)
}
