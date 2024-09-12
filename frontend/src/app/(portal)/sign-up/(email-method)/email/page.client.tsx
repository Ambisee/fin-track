"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Cookies from "js-cookie"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { ArrowRightIcon, ReloadIcon } from "@radix-ui/react-icons"
import { useRouter } from "next/navigation"
import { useState } from "react"

const formSchema = z.object({
	email: z.string().email("Please provide a valid email address")
})

export default function SignUpEmail() {
	const router = useRouter()
	const { toast } = useToast()
	const [isPendingSubmit, setIsPendingSubmit] = useState(false)

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
					setIsPendingSubmit(true)
					form.handleSubmit(
						(formData) => {
							Cookies.set("reg-email", formData.email)
							router.push("/sign-up/username")
						},
						(errors) => {
							setIsPendingSubmit(false)
							toast({
								description: errors.email?.message,
								variant: "destructive"
							})
						}
					)()
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
						<Button disabled={isPendingSubmit}>
							Next
							{isPendingSubmit ? (
								<ReloadIcon className="ml-2 h-4 w-4 animate-spin" />
							) : (
								<ArrowRightIcon className="ml-2" />
							)}
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
									router.push("/sign-in/email")
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
