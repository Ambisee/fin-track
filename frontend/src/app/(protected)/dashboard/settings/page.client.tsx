"use client"

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { Button, buttonVariants } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import ComboBox from "@/components/ui/combobox"
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
import { Switch } from "@/components/ui/switch"
import { toast, useToast } from "@/components/ui/use-toast"
import PasswordField from "@/components/user/PasswordField"
import {
	ENTRY_QKEY,
	MAX_USERNAME_LENGTH,
	USER_QKEY,
	USER_SETTINGS_QKEY
} from "@/lib/constants"
import { useCurrenciesQuery, useSettingsQuery, useUserQuery } from "@/lib/hooks"
import { sbBrowser } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertDialogTitle } from "@radix-ui/react-alert-dialog"
import { Provider } from "@supabase/supabase-js"
import { useQueryClient } from "@tanstack/react-query"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import googleIcon from "../../../../../public/google-icon.svg"

function SettingsSection(props: {
	children?: JSX.Element
	className?: string
	name?: string
}) {
	return (
		<section className={cn("mt-8 mb-16 max-w-96", props.className)}>
			<h3 className="text-lg mb-4">{props.name}</h3>
			{props.children}
		</section>
	)
}

function InputSkeleton(props: { className?: string }) {
	return <Skeleton className={cn("h-10 w-full", props.className)} />
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
	const userQuery = useUserQuery()

	const currenciesQuery = useCurrenciesQuery()
	const currencies = currenciesQuery.data?.data

	const userSettingsQuery = useSettingsQuery()
	const userSettings = userSettingsQuery.data?.data

	const form = useForm<z.infer<typeof generalSectionFormSchema>>({
		resolver: zodResolver(generalSectionFormSchema),
		values: {
			username: "",
			currency: userSettingsQuery.data?.data?.currency?.currency_name ?? "USD"
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
									currencies !== null &&
									currencies !== undefined &&
									userSettings?.currency?.currency_name !== undefined &&
									userSettings.currency.currency_name !== data.currency
								) {
									const newCurrencyId = currencies.find(
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
										.from("settings")
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
						name="currency"
						render={({ field }) => (
							<FormItem className="grid mt-8">
								<FormLabel>Currency</FormLabel>
								<FormControl>
									{userQuery.isLoading ? (
										<InputSkeleton />
									) : (
										<ComboBox
											closeOnSelect
											value={field.value}
											onChange={(e) => {
												form.setValue("currency", e)
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
					<Button
						className="mt-6"
						variant="default"
						disabled={userQuery.isLoading || isPendingSubmit}
					>
						Save Settings
					</Button>
				</form>
			</Form>
		</SettingsSection>
	)
}

function LinkedAccountChange() {
	const queryClient = useQueryClient()
	const userQuery = useUserQuery()

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
			<ul className="mt-2">
				<li className="rounded-md border p-4">
					<div className="flex justify-between">
						<div className="flex items-center gap-3">
							<span className="w-10 h-10 flex justify-center items-center bg-white rounded-sm">
								<Image
									src={googleIcon}
									alt="Google Icon.svg"
									width={24}
									height={24}
								/>
							</span>
							<p className="text-sm">Google</p>
						</div>
						{userQuery.isLoading ? (
							<Skeleton className="w-20 h-10" />
						) : (
							renderButton("google")
						)}
					</div>
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
	const userQuery = useUserQuery()
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
						<FormItem className="w-full">
							<FormLabel>Email</FormLabel>
							<FormControl>
								{userQuery.isLoading ? (
									<InputSkeleton />
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
	const [isFormSubmitted, setIsFormSubmitted] = useState(false)
	const userQuery = useUserQuery()

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
					<InputSkeleton className="mt-2" />
					<InputSkeleton className="mt-2" />
					<Skeleton className="h-16 mt-2" />
					<InputSkeleton className="mt-2" />
				</>
			)
		}

		const identities = getUserIdentities()
		if (!identities.has("email")) {
			return (
				<div className="mt-2">
					<p className="text-sm text-muted-foreground">
						This account was created through Google. You can enable sign-in
						through password by resetting your password.
					</p>
					<Button
						className="mt-4"
						type="button"
						onClick={async (e) => {
							e.preventDefault()
							const { error } = await sbBrowser.auth.resetPasswordForEmail(
								userQuery.data?.data.user?.email as string,
								{
									redirectTo: `${window.location.origin}/recovery`
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
									"Please check your inbox for a link to reset your password.",
								duration: 1500
							})
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
						<FormItem className="mt-2">
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
						<FormItem className="mt-2">
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
						<FormItem className="mt-4">
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
				<div className="flex justify-between items-center mt-4">
					<Button>Submit</Button>
					<Link
						className={cn(buttonVariants({ variant: "link" }), "h-fit p-0 m-0")}
						href="/forgot-password"
					>
						Forgot your old password?
					</Link>
				</div>
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

						const { data, error } = await sbBrowser.rpc("update_password", {
							old_password: formData.oldPassword,
							new_password: formData.newPassword
						})

						if (error !== null) {
							setIsFormSubmitted(true)
							toast({
								description: error?.message,
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

						setIsFormSubmitted(false)
						form.reset()
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

const mailingSectionFormSchema = z.object({
	allowReport: z.boolean()
})
function MailingSection() {
	const [isPendingSubmit, setIsPendingSubmit] = useState(false)
	const userSettingsQuery = useSettingsQuery()

	const form = useForm<z.infer<typeof mailingSectionFormSchema>>({
		resolver: zodResolver(mailingSectionFormSchema),
		values: {
			allowReport: userSettingsQuery.data?.data?.allow_report ?? false
		}
	})

	return (
		<SettingsSection name="Mailing">
			<Form {...form}>
				<form
					onSubmit={(e) => {
						e.preventDefault()
						form.handleSubmit(async (formData) => {
							setIsPendingSubmit(true)
							const { error } = await sbBrowser
								.from("settings")
								.update({ allow_report: formData.allowReport })
								.eq("id", userSettingsQuery.data?.data?.id as number)

							if (error !== null) {
								toast({
									description: error.message,
									variant: "destructive",
									duration: 1500
								})
								return
							}

							toast({
								description: "New settings data saved.",
								duration: 1500
							})
						})()
					}}
				>
					<FormField
						control={form.control}
						name="allowReport"
						render={({ field }) => (
							<FormItem className="flex flex-row gap-4 justify-between items-center space-y-0">
								<div>
									<FormLabel>Monthly reports</FormLabel>
									<FormDescription>
										Send monthly transaction reports to the inbox.
									</FormDescription>
								</div>
								<FormControl>
									{userSettingsQuery.isLoading ? (
										<Skeleton className="h-6 w-11 rounded-full" />
									) : (
										<Switch
											className="m-0"
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									)}
								</FormControl>
							</FormItem>
						)}
					/>
					<Button className="mt-4" disabled={userSettingsQuery.isLoading}>
						Save Settings
					</Button>
				</form>
			</Form>
		</SettingsSection>
	)
}

function MiscellaneousSection() {
	const router = useRouter()
	const queryClient = useQueryClient()
	const [isDeleteChecked, setIsDeleteChecked] = useState(false)
	const { toast } = useToast()

	return (
		<SettingsSection name="Miscellaneous ">
			<>
				<AlertDialog>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Warning</AlertDialogTitle>
							<AlertDialogDescription>
								<p>
									This action will permanently removes all of your data from our
									servers. You will not be able to sign in and view your entries
									after this action is completed.
								</p>
								<div className="mt-4 mb-4 flex items-start gap-2 text-left md:mt-2 md:items-center">
									<Checkbox
										id="delete-confirmation"
										className="mt-[0.125rem] md:mt-0"
										checked={isDeleteChecked}
										onCheckedChange={() => setIsDeleteChecked((c) => !c)}
									/>
									<label htmlFor="delete-confirmation">
										I understand and would like to proceed with the action.
									</label>
								</div>
							</AlertDialogDescription>
							<AlertDialogFooter>
								<AlertDialogCancel onClick={() => setIsDeleteChecked(false)}>
									Cancel
								</AlertDialogCancel>
								<AlertDialogAction
									variant="destructive"
									disabled={!isDeleteChecked}
									onClick={async () => {
										toast({
											description: "Loading..."
										})

										const response = await fetch("/auth/user", {
											method: "DELETE"
										})

										if (response.status !== 200) {
											toast({
												description: (await response.json()).message,
												variant: "destructive",
												duration: 1500
											})
											return
										}

										toast({
											description:
												"Successfully deleted your account. Redirecting to the home page...",
											duration: 2500
										})
										router.push("/")
									}}
								>
									Delete account
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogHeader>
					</AlertDialogContent>
					<div className="mb-4">
						<span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
							Account Deletion
						</span>
						<br />
						<AlertDialogTrigger asChild>
							<Button className="mt-2" variant="destructive">
								Delete Account
							</Button>
						</AlertDialogTrigger>
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
				</AlertDialog>
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
