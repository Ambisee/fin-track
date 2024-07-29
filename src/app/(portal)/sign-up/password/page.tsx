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
import { ArrowLeftIcon, InfoCircledIcon } from "@radix-ui/react-icons"
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

	const email = useGlobalStore((state) => state.email)
	const username = useGlobalStore((state) => state.username)
	const password = useGlobalStore((state) => state.password)

	const setPassword = useGlobalStore((state) => state.setPassword)
	const clearRegistrationInfo = useGlobalStore(
		(state) => state.clearRegistrationInfo
	)

	const form = useForm<z.infer<typeof formSchema>>({
		mode: "onChange",
		resolver: zodResolver(formSchema),
		criteriaMode: "all",
		defaultValues: {
			password: password ?? "",
			confirmPassword: ""
		}
	})

	return (
		<Form {...form}>
			<form
				className="w-full"
				onSubmit={(e) => {
					e.preventDefault()
					form.handleSubmit((formData) => {
                        Cookies.set("reg-password", formData.password)
						setPassword(formData.password)
						const handleRegistration = async () => {
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
								toast({
									title: "Signup Error",
									description: error.message,
									variant: "destructive"
								})
								return
							}

							clearRegistrationInfo()
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
						}
						handleRegistration()
					})()
				}}
			>
				<Card className="p-2 md:p-4 registration-card">
					<CardHeader>Password</CardHeader>
					<CardContent className="flex flex-col md:justify-start justify-end gap-4">
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<Popover>
										<FormDescription>
											Enter a new password. The password must satisfy the&nbsp;
											<PopoverTrigger asChild>
												<Button variant="link" className="p-0 h-4">
													Password Requirements
												</Button>
											</PopoverTrigger>
											<PopoverContent className="bg-secondary">
												Passwords must
												<ul className="pl-4 list-disc">
													<li>be at least 8 characters long</li>
													<li>contain at least one uppercase letter</li>
													<li>contain at least one lowercase letter</li>
													<li>contain at least one number</li>
													<li>contain at least one special character</li>
												</ul>
											</PopoverContent>
											.
										</FormDescription>
									</Popover>
									<FormControl>
										<PasswordField
											autoFocus
											placeholder="Password"
											{...field}
										/>
									</FormControl>
									<div className="min-h-5 min-w-1 text-sm font-medium text-destructive">
										{form.formState.errors.password?.message}
									</div>
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
					<CardFooter className="flex justify-between">
						<Button
							variant="ghost"
							type="button"
							className="aspect-square p-0 flex gap-2"
							onClick={(e) => {
								router.replace("/sign-up/username")
							}}
						>
							<ArrowLeftIcon />
						</Button>
						<Button>Submit</Button>
					</CardFooter>
				</Card>
			</form>
		</Form>
	)
}
