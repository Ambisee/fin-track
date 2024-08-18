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
		.default("")
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
			username: undefined
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
										<Skeleton className="h-10 w-full" />
									) : (
										<Input
											placeholder={
												userQueries.data?.data.user?.user_metadata["username"]
											}
											{...field}
										/>
									)}
								</FormControl>
								<FormDescription>
									Usernames must only contain alphanumeric characters and at
									most {MAX_USERNAME_LENGTH} characters
								</FormDescription>
							</FormItem>
						)}
					/>

					<Button
						className="mt-4"
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

function AccountSection() {
	return <SettingsSection name="Account"></SettingsSection>
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
