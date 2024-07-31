"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { z } from "zod"

import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel
} from "@/components/ui/form"
import { EyeOpenIcon } from "@radix-ui/react-icons"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import { sbBrowser } from "@/lib/supabase"
import { useToast } from "../ui/use-toast"
import Link from "next/link"
import PasswordField from "./FormField/PasswordField"

const formSchema = z.object({
	email: z.string().email("Please ensure that the email address is valid"),
	password: z.string()
})

export default function EmailSignInForm() {
	const router = useRouter()
	const { toast } = useToast()
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
							toast({ description: "Loading..." })

							const { data, error } = await sbBrowser.auth.signInWithPassword({
								email: formData.email,
								password: formData.password
							})
							if (data.user !== null) {
								router.push("/dashboard")

								return
							}

							toast({
								title: error?.code,
								description: error?.message,
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
								<Button variant="link" className="p-0 max-h-4">
									<Link href="/forgot-password">Forgot your password?</Link>
								</Button>
							</FormDescription>
						</FormItem>
					)}
				/>
				<Button variant="default" className="w-full">
					Submit
				</Button>
			</form>
		</Form>
	)
}
