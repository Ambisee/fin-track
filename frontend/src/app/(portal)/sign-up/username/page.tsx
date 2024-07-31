"use client"

import { useRouter } from "next/navigation"
import { useGlobalStore } from "@/lib/store"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
	Form,
	FormControl,
	FormDescription,
	FormItem,
	FormMessage,
	FormField
} from "@/components/ui/form"
import { ArrowRightIcon, ArrowLeftIcon } from "@radix-ui/react-icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Cookies from "js-cookie"
import { useContext } from "react"
import { MAX_USERNAME_LENGTH } from "@/lib/constants"

const formSchema = z.object({
	username: z
		.string()
		.max(
			MAX_USERNAME_LENGTH,
			`Must be at most ${MAX_USERNAME_LENGTH} characters`
		)
		.regex(/(^$)|(^[a-zA-Z0-9]+$)/, "Must only contain alphanumeric characters")
		.optional()
})

export default function SignUpUsername() {
	const router = useRouter()

	const email = useGlobalStore((state) => state.email)
	const username = useGlobalStore((state) => state.username)
	const setUsername = useGlobalStore((state) => state.setUsername)

	const form = useForm<z.infer<typeof formSchema>>({
		mode: "onChange",
		resolver: zodResolver(formSchema),
		criteriaMode: "all",
		defaultValues: {
			username: username ?? ""
		}
	})

	return (
		<Form {...form}>
			<form
				className="w-full"
				onSubmit={(e) => {
					e.preventDefault()
					form.handleSubmit((formData) => {
						setUsername(formData.username)
						Cookies.set("reg-username", formData.username ?? "")
						router.replace("/sign-up/password")
					})()
				}}
			>
				<Card className="p-2 md:p-4 registration-card">
					<CardHeader>Username (Optional)</CardHeader>
					<CardContent className="flex flex-col md:justify-start justify-end gap-4">
						<FormField
							control={form.control}
							name="username"
							render={({ field }) => (
								<FormItem>
									<FormDescription>
										Enter a username of the account. If you choose to leave this
										field blank, your username will be inferred from your email
										address instead.
									</FormDescription>
									<FormControl>
										<Input autoFocus placeholder="Username" {...field} />
									</FormControl>
									<div className="min-h-5 min-w-1 text-sm font-medium text-destructive">
										{form.formState.errors.username?.message}
									</div>
								</FormItem>
							)}
						/>
					</CardContent>
					<CardFooter className="flex justify-between">
						<Button
							variant="ghost"
							className="aspect-square p-0 flex gap-2"
							type="button"
							onClick={(e) => {
								router.replace("/sign-up/email")
							}}
						>
							<ArrowLeftIcon />
						</Button>
						<Button>
							Next
							<ArrowRightIcon className="ml-2" />
						</Button>
					</CardFooter>
				</Card>
			</form>
		</Form>
	)
}
