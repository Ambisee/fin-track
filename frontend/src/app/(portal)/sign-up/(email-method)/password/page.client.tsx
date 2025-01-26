"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { FormEventHandler, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem
} from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"
import PasswordField from "@/components/user/PasswordField"
import { MAX_USERNAME_LENGTH } from "@/lib/constants"
import { sbBrowser } from "@/lib/supabase"
import { ArrowLeftIcon, ReloadIcon } from "@radix-ui/react-icons"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import { useTransitionContext } from "@/components/user/Transition/TransitionRoot"

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
	const [isPendingSubmit, setIsPendingSubmit] = useState(false)

	const { navigateTo } = useTransitionContext()

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

	const handleOnSubmit: FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault()
		form.handleSubmit(
			async (formData) => {
				setIsPendingSubmit(true)
				Cookies.set("reg-password", formData.password)
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
							The accont has been successfully created. Please check your inbox
							and follow the verification link to verify your account.
						</p>
					),
					duration: 15000
				})

				Cookies.remove("reg-password")
				Cookies.remove("reg-email")
				Cookies.remove("reg-username")
				setIsPendingSubmit(false)
				router.push("/sign-in")
			},
			(error) => {}
		)()
	}

	return (
		<Form {...form}>
			<form className="w-full h-full" onSubmit={handleOnSubmit}>
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
				<CardFooter className="flex justify-between">
					<Button
						variant="ghost"
						type="button"
						className="aspect-square p-0 flex gap-2"
						onClick={(e) => {
							navigateTo("/sign-up/username")
						}}
					>
						<ArrowLeftIcon />
					</Button>
					<Button disabled={isPendingSubmit}>
						{isPendingSubmit && (
							<ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
						)}
						{isPendingSubmit ? "Loading" : "Submit"}
					</Button>
				</CardFooter>
			</form>
		</Form>
	)
}
