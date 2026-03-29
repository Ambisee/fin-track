"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { SubmitEventHandler, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup
} from "@/components/ui/field"
import PasswordField from "@/components/user/PasswordField"
import { MAX_USERNAME_LENGTH, SHORT_TOAST_DURATION } from "@/lib/constants"
import { supabaseClient } from "@/lib/supabase"
import { ArrowLeftIcon, ReloadIcon } from "@radix-ui/react-icons"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useSignupTransition } from "../layout"

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
	const [supabase] = useState(supabaseClient())
	const [isPendingSubmit, setIsPendingSubmit] = useState(false)

	const { navigateTo } = useSignupTransition()

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

	const handleOnSubmit: SubmitEventHandler = (e) => {
		e.preventDefault()
		form.handleSubmit(
			async (formData) => {
				setIsPendingSubmit(true)
				Cookies.set("reg-password", formData.password)
				if (email === undefined) {
					toast.error("Signup Error", {
						description: "Missing signup information"
					})
					return
				}

				const recipient = email.substring(0, email.search("@"))
				const { error } = await supabase.auth.signUp({
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
					toast.error("Signup Error", { description: error.message })
					return
				}

				toast.info("Signup Success", {
					description: (
						<p>
							The accont has been successfully created. Please check your inbox
							and follow the verification link to verify your account.
						</p>
					),
					duration: SHORT_TOAST_DURATION
				})

				Cookies.remove("reg-password")
				Cookies.remove("reg-email")
				Cookies.remove("reg-username")
				setIsPendingSubmit(false)
				router.push("/sign-in")
			},
			() => {}
		)()
	}

	return (
		<form className="w-full h-full" onSubmit={handleOnSubmit}>
			<CardHeader>Password</CardHeader>
			<CardContent className="flex flex-col md:justify-start justify-end gap-4">
				<FieldGroup>
					<Controller
						control={form.control}
						name="password"
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<PasswordField
									autoFocus
									placeholder="Password"
									aria-invalid={fieldState.invalid}
									{...field}
								/>
								<div className="min-h-5 min-w-1">
									{fieldState.error && (
										<FieldError
											className="text-sm font-medium"
											errors={[fieldState.error]}
										/>
									)}
								</div>
								<FieldDescription>
									Passwords must have at least 8 characters and include
									lowercase, uppercase, number, and special characters.
								</FieldDescription>
							</Field>
						)}
					/>
					<Controller
						control={form.control}
						name="confirmPassword"
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<PasswordField
									placeholder="Confirm Password"
									aria-invalid={fieldState.invalid}
									{...field}
								/>
								<div className="min-h-5 min-w-1">
									{fieldState.error && (
										<FieldError
											className="text-sm font-medium"
											errors={[fieldState.error]}
										/>
									)}
								</div>
							</Field>
						)}
					/>
				</FieldGroup>
			</CardContent>
			<CardFooter className="flex justify-between">
				<Button
					variant="ghost"
					type="button"
					className="aspect-square p-0 flex gap-2"
					onClick={() => navigateTo("/sign-up/username")}
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
	)
}
