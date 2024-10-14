"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

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
import { ReloadIcon } from "@radix-ui/react-icons"

import { sbBrowser } from "@/lib/supabase"
import Link from "next/link"
import { useToast } from "../ui/use-toast"
import PasswordField from "./PasswordField"

const formSchema = z.object({
	email: z.string().email("Please provide a valid email address"),
	password: z.string()
})

function UnverifiedMesssage(props: { formData: z.infer<typeof formSchema> }) {
	const { toast } = useToast()

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
					onClick={async (e) => {
						toast({
							description: "Loading..."
						})

						await sbBrowser.auth.resend({
							type: "signup",
							email: props.formData.email
						})

						toast({
							description:
								"The verification email has been sent. Please check your inbox to complete the verification process."
						})
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
	const { toast } = useToast()
	const [isFormLoading, setIsFormLoading] = useState(false)
	const form = useForm<z.infer<typeof formSchema>>({
		mode: "onSubmit",
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: ""
		}
	})

	const renderError = () => {
		const {
			formState: { errors }
		} = form
		const emailError = errors.email?.message && <li>{errors.email?.message}</li>
		const passwordError = errors.password?.message && (
			<li>{errors.password?.message}</li>
		)

		return (
			<ul className="pl-4 list-outside list-disc">
				{emailError}
				{passwordError}
			</ul>
		)
	}

	return (
		<Form {...form}>
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

							toast({
								description: <Message formData={formData} />,
								variant: "destructive"
							})
						},
						(error) => {
							toast({
								title: "Invalid sign in credentials",
								description: renderError()
							})
						}
					)()
				}}
			>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input inputMode="email" placeholder="Email" {...field} />
							</FormControl>
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Password</FormLabel>
							<FormControl>
								<div className="relative">
									<PasswordField placeholder="Password" {...field} />
								</div>
							</FormControl>
							<FormDescription className="flex justify-end">
								<Button variant="link" className="p-0 max-h-4 text-sm">
									<Link href="/forgot-password">Forgot your password?</Link>
								</Button>
							</FormDescription>
						</FormItem>
					)}
				/>
				<Button variant="default" disabled={isFormLoading} className="w-full">
					{isFormLoading && (
						<ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
					)}
					{isFormLoading ? "Loading" : "Submit"}
				</Button>
			</form>
		</Form>
	)
}
