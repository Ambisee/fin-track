"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { ReactNode, useState } from "react"
import { FieldErrors, FieldValues, useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel
} from "@/components/ui/field"
import { Controller } from "react-hook-form"
import { ReloadIcon } from "@radix-ui/react-icons"

import { sbBrowser } from "@/lib/supabase"
import Link from "next/link"
import { toast } from "sonner"
import PasswordField from "./PasswordField"

const formSchema = z.object({
	email: z.string().email("Please provide a valid email address"),
	password: z.string()
})

function UnverifiedMesssage(props: { formData: z.infer<typeof formSchema> }) {
	return (
		<>
			<p>
				Your account has not been verified. Please verify your account before
				signing in.
			</p>
			<p>
				<Button
					variant="link"
					className="w-fit h-fit p-0 m-0"
					onClick={async () => {
						const toastId = toast.loading("Loading...")

						await sbBrowser.auth.resend({
							type: "signup",
							email: props.formData.email
						})

						toast.dismiss(toastId)
						toast.info(
							"The verification email has been sent. Please check your inbox to complete the verification process."
						)
					}}
				>
					Click here to resend the verification email
				</Button>
			</p>
		</>
	)
}

function InvalidCredentialsMessage() {
	return (
		<p>
			Invalid credentials. Please make sure that you have the correct email and
			password.
		</p>
	)
}

const messageComponents = new Map([
	["email_not_confirmed", UnverifiedMesssage],
	["invalid_credentials", InvalidCredentialsMessage]
])

export default function EmailSignInForm() {
	const router = useRouter()
	const [isFormLoading, setIsFormLoading] = useState(false)
	const form = useForm<z.infer<typeof formSchema>>({
		mode: "onSubmit",
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: ""
		}
	})

	const renderError: <T extends FieldValues>(
		error: FieldErrors<T>
	) => ReactNode = <T extends FieldValues>(errors: FieldErrors<T>) => {
		const errorMessages = []
		for (const k in errors) {
			if (errors[k]?.message === undefined) {
				continue
			}

			errorMessages.push(errors[k].message.toString())
		}

		return (
			<ul className="pl-4 list-outside list-disc">
				{errorMessages.map((message) => (
					<li key={message}>{message}</li>
				))}
			</ul>
		)
	}

	return (
		<form
			className="grid gap-4"
			onSubmit={(e) => {
				e.preventDefault()
				form.handleSubmit(
					async (formData) => {
						setIsFormLoading(true)
						const { data, error } = await sbBrowser.auth.signInWithPassword({
							email: formData.email,
							password: formData.password
						})

						if (data.user !== null) {
							router.push("/dashboard")

							return
						}

						setIsFormLoading(false)
						let Message

						if (error?.code) {
							Message =
								messageComponents.get(error.code) ??
								function () {
									return <p>{error.code}</p>
								}
						} else {
							Message = function Message() {
								return <p>Unknown error occured. Please try again later.</p>
							}
						}

						toast.error(<Message formData={formData} />)
					},
					(error) => {
						toast.error("Invalid sign in credentials", {
							description: renderError(error)
						})
					}
				)()
			}}
		>
			<FieldGroup>
				<Controller
					control={form.control}
					name="email"
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<FieldLabel>Email</FieldLabel>
							<Input
								inputMode="email"
								placeholder="Email"
								aria-invalid={fieldState.invalid}
								{...field}
							/>
						</Field>
					)}
				/>
				<Controller
					control={form.control}
					name="password"
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<FieldLabel>Password</FieldLabel>
							<div className="relative">
								<PasswordField
									placeholder="Password"
									aria-invalid={fieldState.invalid}
									{...field}
								/>
							</div>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
							<FieldDescription className="flex justify-end">
								<Button variant="link" className="p-0 max-h-4 text-sm">
									<Link href="/forgot-password">Forgot your password?</Link>
								</Button>
							</FieldDescription>
						</Field>
					)}
				/>
			</FieldGroup>
			<Button variant="default" disabled={isFormLoading} className="w-full">
				{isFormLoading ? "Loading" : "Submit"}
				{isFormLoading && <ReloadIcon className="ml-2 h-4 w-4 animate-spin" />}
			</Button>
		</form>
	)
}
