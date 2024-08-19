"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
	ENTRY_QKEY,
	USER_QKEY,
	USER_SETTINGS_QKEY,
	SUPPORTED_CURRENCIES_QKEY
} from "@/lib/constants"
import { sbBrowser } from "@/lib/supabase"
import { zodResolver } from "@hookform/resolvers/zod"
import {
	QueryClient,
	useMutation,
	useQuery,
	useQueryClient
} from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import ComboBox from "@/components/ui/combobox"

function SettingsSection(props: { children?: JSX.Element; name?: string }) {
	return (
		<section className="mt-8 mb-16">
			<h3 className="text-lg mb-4">{props.name}</h3>
			{props.children}
		</section>
	)
}

const generalSectionFormSchema = z.object({
	username: z
		.string()
		.max(
			MAX_USERNAME_LENGTH,
			`Must be at most ${MAX_USERNAME_LENGTH} characters`
		)
		.regex(/(^$)|(^[a-zA-Z0-9]+$)/, "Must only contain alphanumeric characters")
		.default(""),
	currency: z.string()
})

function GeneralSection() {
	const { toast } = useToast()
	const [isPendingSubmit, setIsPendingSubmit] = useState(false)
	const queryClient = useQueryClient()
	const userQueries = useQuery({
		queryKey: USER_QKEY,
		queryFn: () => sbBrowser.auth.getUser(),
		refetchOnMount: (query) => {
			return query.state.data === undefined
		}
	})

	const supportedCurrenciesQuery = useQuery({
		queryKey: SUPPORTED_CURRENCIES_QKEY,
		queryFn: async () =>
			await sbBrowser.from("supported_currencies").select("*")
	})
	const supportedCurrencies = supportedCurrenciesQuery.data?.data

	const userSettingsQuery = useQuery({
		queryKey: USER_SETTINGS_QKEY,
		queryFn: async () =>
			await sbBrowser
				.from("user_settings")
				.select(`*, supported_currencies (currency_name)`)
				.limit(1)
				.single()
	})
	const userSettings = userSettingsQuery.data?.data

	const form = useForm<z.infer<typeof generalSectionFormSchema>>({
		resolver: zodResolver(generalSectionFormSchema),
		defaultValues: {
			username: "",
			currency:
				userSettingsQuery.data?.data?.supported_currencies?.currency_name ??
				"USD"
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
										return
									}
								}

								if (
									supportedCurrencies !== null &&
									supportedCurrencies !== undefined &&
									userSettings?.supported_currencies?.currency_name !==
										undefined &&
									userSettings.supported_currencies.currency_name !==
										data.currency
								) {
									const newCurrencyId = supportedCurrencies.find(
										(value) => value.currency_name === data.currency
									)
									if (newCurrencyId === undefined) {
										toast({
											description: "Invalid currency value provided",
											variant: "destructive",
											duration: 1500
										})
										return
									}

									const { error } = await sbBrowser
										.from("user_settings")
										.update({ currency_id: newCurrencyId.id })
										.eq("id", userSettings.id)

									if (error !== null) {
										toast({
											description: error.message,
											variant: "destructive",
											duration: 1500
										})
										return
									}
								}

								queryClient.invalidateQueries({ queryKey: USER_QKEY })
								queryClient.invalidateQueries({ queryKey: USER_SETTINGS_QKEY })
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
									{userQueries.isLoading ? (
										<Skeleton className="h-10 w-full max-w-96" />
									) : (
										<Input
											className="w-full max-w-96"
											placeholder={
												userQueries.data?.data.user?.user_metadata["username"]
											}
											{...field}
										/>
									)}
								</FormControl>
								{userQueries.isLoading ? (
									<Skeleton className="h-6 w-full max-w-40" />
								) : (
									<FormDescription className="max-w-96">
										Usernames must only contain alphanumeric characters and at
										most {MAX_USERNAME_LENGTH} characters
									</FormDescription>
								)}
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="currency"
						render={({ field }) => (
							<FormItem className="grid mt-8">
								<FormLabel>Currency</FormLabel>
								<FormControl>
									{userQueries.isLoading ? (
										<Skeleton className="h-10 w-full max-w-96" />
									) : (
										<ComboBox
											closeOnSelect
											value={field.value}
											onChange={(e) => {
												form.setValue("currency", e)
											}}
											values={
												supportedCurrencies?.map((val) => ({
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
					<Button
						className="mt-6"
						variant="default"
						disabled={userQueries.isLoading || isPendingSubmit}
					>
						Update Data
					</Button>
				</form>
			</Form>
		</SettingsSection>
	)
}

const emailFieldFormSchema = z.object({
	email: z.string().email("Please provide a valid email").default("")
})
function EmailField() {
	const userQueries = useQuery({
		queryKey: USER_QKEY,
		queryFn: () => sbBrowser.auth.getUser(),
		refetchOnMount: (query) => {
			return query.state.data === undefined
		}
	})

	const form = useForm<z.infer<typeof emailFieldFormSchema>>({
		resolver: zodResolver(emailFieldFormSchema),
		defaultValues: {
			email: ""
		}
	})

	const renderEmailMessage = () => {
		const user = userQueries.data?.data.user
		if (user === undefined || user === null) {
			return <></>
		}

		if (user.app_metadata.provider === "google") {
			return (
				<>
					This account was created through Google. Please enter an email that
					ends with <i>@gmail.com</i>
				</>
			)
		}

		return (
			<>
				This account was created through email and password. Please enter a
				valid email address
			</>
		)
	}

	return (
		<Form {...form}>
			<form>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem className="w-full max-w-96">
							<FormLabel>Email</FormLabel>
							<FormControl>
								{userQueries.isLoading ? (
									<Skeleton className="h-10 w-full" />
								) : (
									<Input placeholder="Email" {...field} />
								)}
							</FormControl>
							{userQueries.isLoading ? (
								<Skeleton className="h-6 w-full max-w-40" />
							) : (
								<FormDescription>{renderEmailMessage()}</FormDescription>
							)}
						</FormItem>
					)}
				/>
				<Button
					disabled={userQueries.isLoading}
					className="mt-6"
					onClick={(e) => e.preventDefault()}
				>
					Submit
				</Button>
			</form>
		</Form>
	)
}

function AccountSection() {
	return (
		<SettingsSection name="Account">
			<EmailField />
		</SettingsSection>
	)
}

function MiscellaneousSection() {
	const router = useRouter()
	const queryClient = useQueryClient()
	const { toast } = useToast()

	return (
		<SettingsSection name="Miscellaneous">
			<>
				<div className="mb-4">
					<span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
						Delete Account
					</span>
					<br />
					<Button className="mt-2" variant="destructive">
						Delete Account
					</Button>
				</div>
				<div>
					<span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
						Log out of your account
					</span>
					<br />
					<Button
						className="mt-2"
						variant="default"
						onClick={async () => {
							toast({ description: "Loading..." })
							const { error } = await sbBrowser.auth.signOut()

							if (error !== null) {
								toast({ description: error.message })
							}

							queryClient.removeQueries({ queryKey: USER_QKEY })
							queryClient.removeQueries({ queryKey: ENTRY_QKEY })
							router.push("/")
						}}
					>
						Logout
					</Button>
				</div>
			</>
		</SettingsSection>
	)
}

export default function DashboardSettings() {
	return (
		<div className="w-full">
			<h1 className="text-2xl mb-4">Settings</h1>
			<GeneralSection />
			<AccountSection />
			<MiscellaneousSection />
		</div>
	)
}
