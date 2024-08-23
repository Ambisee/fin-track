"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"

import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
	ArrowLeftIcon,
	InfoCircledIcon,
	ReloadIcon
} from "@radix-ui/react-icons"
import { useRouter } from "next/navigation"
import PasswordField from "@/components/user/FormField/PasswordField"
import { useGlobalStore } from "@/lib/store"
import Cookies from "js-cookie"
import {
	Popover,
	PopoverTrigger,
	PopoverContent
} from "@/components/ui/popover"
import { sbBrowser } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { MAX_USERNAME_LENGTH } from "@/lib/constants"

const formSchema = z
	.object({
		password: z
			.string()
			.min(8, "Must be at least 8 characters long")
			.regex(/.*[A-Z].*/, "Must contain at least one uppercase letter")
			.regex(/.*[a-z].*/, "Must contain at least one lowercase letter")
			.regex(/.*[0-9].*/, "Must contain at least one digit")
			.regex(
				/.*[!@#\$%^&*()_+{}\[\]:;<>,.?~].*/,
				"Must contain at least one special character"
			),
		confirmPassword: z.string()
	})
	.refine((data) => data.confirmPassword === data.password, {
		message: "Passwords do not match",
		path: ["confirmPassword"]
	})

export default function SignUpPassword() {
	const router = useRouter()
	const { toast } = useToast()
	const [isFormLoading, setIsPendingSubmit] = useState(false)

	const email = Cookies.get("reg-email") as string
	const username = Cookies.get("reg-username") as string
	const form = useForm<z.infer<typeof formSchema>>({
		mode: "onChange",
		resolver: zodResolver(formSchema),
		criteriaMode: "all",
		defaultValues: {
			password: "",
			confirmPassword: ""
		}
	})

	return (
		<Form {...form}>
			<form
				className="w-full h-full"
				onSubmit={(e) => {
					e.preventDefault()
					form.handleSubmit(
						async (formData) => {
							Cookies.set("reg-password", formData.password)
							setIsPendingSubmit(true)
							if (email === undefined) {
								toast({
									title: "Signup Error",
									description: "Missing signup information",
									variant: "destructive"
								})
								return
							}

							const recipient = email.substring(0, email.search("@"))
							const { error } = await sbBrowser.auth.signUp({
								email: email,
								password: formData.password,
								options: {
									data: {
										username:
											username ??
											recipient.substring(
												0,
												Math.min(MAX_USERNAME_LENGTH - 1, recipient.length)
											)
									}
								}
							})

							if (error !== null) {
								setIsPendingSubmit(false)
								toast({
									title: "Signup Error",
									description: error.message,
									variant: "destructive"
								})
								return
							}

							toast({
								title: "Signup Success",
								description: (
									<p>
										The accont has been successfully created. Please check your
										inbox <u>{email}</u>&nbsp; for an email and click the link
										inside to verify your account before signing in.
									</p>
								)
							})

							Cookies.remove("reg-password")
							Cookies.remove("reg-email")
							Cookies.remove("reg-username")
							setIsPendingSubmit(false)
							router.push("/signin")
						},
						(error) => {}
					)()
				}}
			>
				<CardHeader>Password</CardHeader>
				<CardContent className="flex flex-col md:justify-start justify-end gap-4">
					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<PasswordField autoFocus placeholder="Password" {...field} />
								</FormControl>
								<div className="min-h-5 min-w-1 text-sm font-medium text-destructive">
									{form.formState.errors.password?.message}
								</div>
								<FormDescription>
									Passwords must have at least 8 characters and include
									lowercase, uppercase, number, and special characters.
								</FormDescription>
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="confirmPassword"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<PasswordField placeholder="Confirm Password" {...field} />
								</FormControl>
								<div className="min-h-5 min-w-1 text-sm font-medium text-destructive">
									{form.formState.errors.confirmPassword?.message}
								</div>
							</FormItem>
						)}
					/>
				</CardContent>
				<CardFooter className="flex justify-between footer">
					<Button
						variant="ghost"
						type="button"
						className="aspect-square p-0 flex gap-2"
						onClick={(e) => {
							router.replace("/signup/username")
						}}
					>
						<ArrowLeftIcon />
					</Button>
					<Button disabled={isFormLoading}>
						{isFormLoading && (
							<ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
						)}
						{isFormLoading ? "Loading" : "Submit"}
					</Button>
				</CardFooter>
			</form>
		</Form>
	)
}
