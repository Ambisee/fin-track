"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Cookies from "js-cookie"
import { z } from "zod"

import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem
} from "@/components/ui/form"
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogAction,
	AlertDialogHeader,
	AlertDialogDescription,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowRightIcon } from "@radix-ui/react-icons"
import { useGlobalStore } from "@/lib/store"
import { useRouter } from "next/navigation"

const formSchema = z.object({
	email: z.string().email("Please provide a valid email address")
})

export default function SignUpEmail() {
	const router = useRouter()

	const email = Cookies.get("reg-email")
	const form = useForm<z.infer<typeof formSchema>>({
		mode: "onChange",
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: email ?? ""
		}
	})

	return (
		<Form {...form}>
			<form
				className="w-full"
				onSubmit={(e) => {
					e.preventDefault()
					form.handleSubmit((formData) => {
						Cookies.set("reg-email", formData.email)
						router.push("/signup/username")
					})()
				}}
			>
				<CardHeader>Email</CardHeader>
				<CardContent className="flex flex-col">
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Input autoFocus inputMode="email" {...field} />
								</FormControl>
								<div className="min-h-5 min-w-1 text-sm font-medium text-destructive">
									{form.formState.errors.email?.message}
								</div>
							</FormItem>
						)}
					/>
				</CardContent>
				<AlertDialog>
					<CardFooter className="flex justify-end justify-self-end">
						<Button>
							Next
							<ArrowRightIcon className="ml-2" />
						</Button>
					</CardFooter>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Exit Registration</AlertDialogTitle>
							<AlertDialogDescription>
								Are you sure you want to exit the registration page? Doing so
								will reset all data previously entered.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								variant="destructive"
								onClick={() => {
									Cookies.remove("reg-email")
									Cookies.remove("reg-username")
									router.push("/signin/email")
								}}
							>
								Proceed
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</form>
		</Form>
	)
}
