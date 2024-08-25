"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { toast, useToast } from "@/components/ui/use-toast"
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
import PasswordField from "@/components/user/FormField/PasswordField"
import { cn } from "@/lib/utils"
import googleIcon from "../../../../../public/google-icon.svg"
import Image from "next/image"
import { Provider } from "@supabase/supabase-js"

function SettingsSection(props: {
	children?: JSX.Element
	className?: string
	name?: string
}) {
	return (
		<section className={cn("mt-8 mb-16", props.className)}>
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
	const userQuery = useQuery({
		queryKey: USER_QKEY,
		queryFn: () => sbBrowser.auth.getUser(),
		refetchOnWindowFocus: false,
		refetchOnMount: (query) => {
			return query.state.data === undefined
		}
	})

	const supportedCurrenciesQuery = useQuery({
		queryKey: SUPPORTED_CURRENCIES_QKEY,
		queryFn: async () =>
			await sbBrowser.from("supported_currencies").select("*"),
		refetchOnWindowFocus: false,
		refetchOnMount: (query) => query.state.data === undefined
	})
	const supportedCurrencies = supportedCurrenciesQuery.data?.data

	const userSettingsQuery = useQuery({
		queryKey: USER_SETTINGS_QKEY,
		queryFn: async () =>
			await sbBrowser
				.from("user_settings")
				.select(`*, supported_currencies (currency_name)`)
				.limit(1)
				.single(),
		refetchOnWindowFocus: false,
		refetchOnMount: (query) => query.state.data === undefined
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
								form.resetField("username")
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
										<Skeleton className="h-10 w-full max-w-96" />
									) : (
										<Input
											className="w-full max-w-96"
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
									{userQuery.isLoading ? (
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
						disabled={userQuery.isLoading || isPendingSubmit}
					>
						Update Data
					</Button>
				</form>
			</Form>
		</SettingsSection>
	)
}

function LinkedAccountChange() {
	const queryClient = useQueryClient()
	const userQuery = useQuery({
		queryKey: USER_QKEY,
		queryFn: () => sbBrowser.auth.getUser(),
		refetchOnWindowFocus: false,
		refetchOnMount: (query) => query.state.data === undefined
	})

	const getIdentityProviders = () => {
		const result = new Set()
		const identities = userQuery.data?.data.user?.identities
		if (identities === undefined) {
			return result
		}

		for (const identity of identities) {
			result.add(identity.provider)
		}

		return result
	}

	const renderButton = (provider: string) => {
		if (userQuery.data?.data.user?.identities === undefined) {
			return undefined
		}

		const identityProviders = getIdentityProviders()
		if (identityProviders.has(provider)) {
			const identity = userQuery.data.data.user.identities.find(
				(value) => value.provider === provider
			)

			if (identity === undefined) {
				return undefined
			}

			return (
				<Button
					variant="outline"
					disabled={identityProviders.size === 1}
					onClick={async (e) => {
						e.preventDefault()
						const { error } = await sbBrowser.auth.unlinkIdentity(identity)

						if (error !== null) {
							toast({
								description: error.message,
								variant: "destructive"
							})
							return
						}

						queryClient.invalidateQueries({ queryKey: USER_QKEY })
					}}
				>
					Unlink
				</Button>
			)
		}

		return (
			<Button
				variant="default"
				onClick={async (e) => {
					e.preventDefault()
					const { error } = await sbBrowser.auth.linkIdentity({
						provider: provider as Provider,
						options: {
							redirectTo: `${window.location.origin}/dashboard/settings`
						}
					})

					if (error !== null) {
						toast({
							description: error.message,
							variant: "destructive"
						})
						return
					}

					queryClient.invalidateQueries({ queryKey: USER_QKEY })
				}}
			>
				Link Account
			</Button>
		)
	}

	return (
		<div className="mt-2">
			<span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
				Linked Accounts
			</span>
			<ul className="max-w-96 mt-2">
				<li className="flex justify-between rounded-md border p-4">
					<div className="flex items-center gap-3">
						<span className="w-10 h-10 flex justify-center items-center bg-white rounded-sm">
							<Image
								src={googleIcon}
								alt="Google Icon.svg"
								width={24}
								height={24}
							/>
						</span>
						<div className="text-sm">Google</div>
					</div>
					{userQuery.isLoading ? (
						<Skeleton className="w-20 h-10" />
					) : (
						renderButton("google")
					)}
				</li>
			</ul>
		</div>
	)
}

const emailChangeFormSchema = z.object({
	email: z.string().email("Please provide a valid email").default("")
})
function EmailChange() {
	const { toast } = useToast()
	const userQuery = useQuery({
		queryKey: USER_QKEY,
		queryFn: () => sbBrowser.auth.getUser(),
		refetchOnWindowFocus: false,
		refetchOnMount: (query) => query.state.data === undefined
	})

	const form = useForm<z.infer<typeof emailChangeFormSchema>>({
		resolver: zodResolver(emailChangeFormSchema),
		defaultValues: {
			email: ""
		}
	})

	return (
		<Form {...form}>
			<form
				className="mt-8"
				onSubmit={(e) => {
					e.preventDefault()
					form.handleSubmit(async (d) => {
						const { data, error } = await sbBrowser.auth.updateUser(
							{
								email: d.email
							},
							{
								emailRedirectTo: window.location.origin
							}
						)

						if (error !== null) {
							toast({
								description: error.message,
								variant: "destructive",
								duration: 1500
							})
							return
						}

						toast({
							description:
								"Please check your previous and new email's inbox to verify the email change."
						})
					})()
				}}
			>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem className="w-full max-w-96">
							<FormLabel>Email</FormLabel>
							<FormControl>
								{userQuery.isLoading ? (
									<Skeleton className="h-10 w-full" />
								) : (
									<Input
										placeholder={userQuery.data?.data.user?.email}
										{...field}
									/>
								)}
							</FormControl>
							{form.formState.errors.email && (
								<FormMessage>{form.formState.errors.email.message}</FormMessage>
							)}
						</FormItem>
					)}
				/>
				<Button disabled={userQuery.isLoading} className="mt-6">
					Submit
				</Button>
			</form>
		</Form>
	)
}

const passwordChangeFormSchema = z
	.object({
		oldPassword: z.string(),
		newPassword: z
			.string()
			.min(8, "Must be at least 8 characters long")
			.regex(/.*[A-Z].*/, "Must contain at least one uppercase letter")
			.regex(/.*[a-z].*/, "Must contain at least one lowercase letter")
			.regex(/.*[0-9].*/, "Must contain at least one digit")
			.regex(
				/.*[!@#\$%^&*()_+{}\[\]:;<>,.?~].*/,
				"Must contain at least one special character"
			),
		confirmNewPassword: z.string()
	})
	.refine((data) => data.confirmNewPassword === data.newPassword, {
		message: "New passwords do not match",
		path: ["confirmNewPassword"]
	})

function PasswordChange() {
	const { toast } = useToast()
	const [isPendingSubmit, setIsPendingSubmit] = useState(false)
	const userQuery = useQuery({
		queryKey: USER_QKEY,
		queryFn: () => sbBrowser.auth.getUser(),
		refetchOnWindowFocus: false,
		refetchOnMount: (query) => query.state.data === undefined
	})

	const form = useForm<z.infer<typeof passwordChangeFormSchema>>({
		mode: "onChange",
		resolver: zodResolver(passwordChangeFormSchema),
		defaultValues: {
			oldPassword: "",
			newPassword: "",
			confirmNewPassword: ""
		}
	})

	const getUserIdentities = () => {
		const result = new Set()
		const identities = userQuery.data?.data.user?.identities
		if (identities === undefined) {
			return result
		}

		for (const identity of identities) {
			result.add(identity.provider)
		}

		return result
	}

	const renderFormFields = () => {
		if (userQuery.isLoading) {
			return (
				<>
					<Skeleton className="h-10 mt-2 max-w-96" />
					<Skeleton className="h-10 mt-2 max-w-96" />
					<Skeleton className="h-16 mt-2 max-w-96" />
					<Skeleton className="h-10 mt-2 max-w-96" />
				</>
			)
		}

		const identities = getUserIdentities()
		if (!identities.has("email")) {
			return (
				<div className="mt-2">
					<p className="text-sm text-muted-foreground max-w-96">
						This account was created through Google. You can enable sign-in
						through password by resetting your password.
					</p>
					<Button
						className="mt-4"
						type="button"
						onClick={(e) => {
							e.preventDefault()
							sbBrowser.auth.resetPasswordForEmail(
								userQuery.data?.data.user?.email as string,
								{
									redirectTo: `${window.location.origin}/recovery`
								}
							)
						}}
					>
						Reset Password
					</Button>
				</div>
			)
		}

		return (
			<>
				<FormField
					control={form.control}
					name="oldPassword"
					render={({ field }) => (
						<FormItem className="max-w-96 mt-2">
							<FormControl>
								<PasswordField placeholder="Old password" {...field} />
							</FormControl>
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="newPassword"
					render={({ field }) => (
						<FormItem className="max-w-96 mt-2">
							<FormControl>
								<PasswordField placeholder="New password" {...field} />
							</FormControl>
							{form.formState.errors.newPassword && (
								<div className="min-h-5 min-w-1 text-sm font-medium text-destructive">
									{form.formState.errors.newPassword.message}
								</div>
							)}
							<FormDescription>
								Passwords must have at least 8 characters and include lowercase,
								uppercase, number, and special characters.
							</FormDescription>
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="confirmNewPassword"
					render={({ field }) => (
						<FormItem className="max-w-96 mt-4">
							<FormControl>
								<PasswordField placeholder="Confirm new password" {...field} />
							</FormControl>
							{form.formState.errors.confirmNewPassword && (
								<div className="text-sm font-medium text-destructive">
									{form.formState.errors.confirmNewPassword.message}
								</div>
							)}
						</FormItem>
					)}
				/>
				<Button className="mt-4">Submit</Button>
			</>
		)
	}

	return (
		<Form {...form}>
			<form
				className="mt-8"
				onSubmit={(e) => {
					e.preventDefault()
					form.handleSubmit(async (formData) => {
						setIsPendingSubmit(true)
						const { error: signInError } = await sbBrowser.auth.reauthenticate()

						if (signInError !== null) {
							toast({
								description: signInError.message,
								variant: "destructive"
							})
							setIsPendingSubmit(false)

							return
						}

						const { error: updateError } = await sbBrowser.auth.updateUser({
							password: formData.newPassword
						})

						if (updateError !== null) {
							toast({
								description: updateError.message,
								variant: "destructive",
								duration: 1500
							})
							setIsPendingSubmit(false)
							return
						}

						setIsPendingSubmit(false)
						toast({
							description: "Successfully updated the account's password",
							duration: 1500
						})
					})()
				}}
			>
				<FormLabel>Password</FormLabel>
				{renderFormFields()}
			</form>
		</Form>
	)
}

function AccountSection() {
	return (
		<SettingsSection name="Account">
			<>
				<LinkedAccountChange />
				<EmailChange />
				<PasswordChange />
			</>
		</SettingsSection>
	)
}

function MailingSection() {
	return <SettingsSection name="Mailing"></SettingsSection>
}

function MiscellaneousSection() {
	const router = useRouter()
	const queryClient = useQueryClient()
	const { toast } = useToast()

	return (
		<SettingsSection name="Miscellaneous ">
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
			<MailingSection />
			<MiscellaneousSection />
		</div>
	)
}
