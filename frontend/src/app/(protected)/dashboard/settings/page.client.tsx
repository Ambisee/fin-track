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
import { MAX_USERNAME_LENGTH } from "@/lib/constants"
import { sbBrowser } from "@/lib/supabase"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
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

const supportedCurrencies = ["USD", "CAD", "GBP", "JPY", "IDR", "KRW"] as const
const currencyZ = z.enum(supportedCurrencies).default("CAD")
const generalSectionFormSchema = z.object({
	username: z
		.string()
		.max(
			MAX_USERNAME_LENGTH,
			`Must be at most ${MAX_USERNAME_LENGTH} characters`
		)
		.regex(/(^$)|(^[a-zA-Z0-9]+$)/, "Must only contain alphanumeric characters")
		.default(""),
	currency: currencyZ
})
function GeneralSection() {
	const [isPendingSubmit, setIsPendingSubmit] = useState(false)
	const userQueries = useQuery({
		queryKey: ["user"],
		queryFn: () => sbBrowser.auth.getUser(),
		refetchOnMount: (query) => {
			return query.state.data === undefined
		}
	})

	const form = useForm<z.infer<typeof generalSectionFormSchema>>({
		resolver: zodResolver(generalSectionFormSchema),
		defaultValues: {
			username: "",
			currency: "CAD"
		}
	})

	return (
		<SettingsSection name="General">
			<Form {...form}>
				<form
					onSubmit={(e) => {
						e.preventDefault()
						form.handleSubmit((data) => {})()
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
								<FormDescription className="max-w-96">
									{userQueries.isLoading ? (
										<Skeleton className="h-6 w-full max-w-40" />
									) : (
										<>
											Usernames must only contain alphanumeric characters and at
											most {MAX_USERNAME_LENGTH} characters
										</>
									)}
								</FormDescription>
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
												form.setValue("currency", e as any)
											}}
											values={supportedCurrencies.map((val) => ({
												value: val,
												label: val
											}))}
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
		queryKey: ["user"],
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
							<FormDescription>
								{userQueries.isLoading ? (
									<Skeleton className="h-6 w-full max-w-40" />
								) : (
									renderEmailMessage()
								)}
							</FormDescription>
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
