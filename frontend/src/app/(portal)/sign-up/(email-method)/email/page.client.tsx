"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Cookies from "js-cookie"
import { Controller, useForm } from "react-hook-form"
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
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ReloadIcon } from "@radix-ui/react-icons"
import { ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { FormEventHandler, useState } from "react"
import { toast } from "sonner"
import { useSignupTransition } from "../layout"

const formSchema = z.object({
	email: z.string().email("Please provide a valid email address")
})

export default function SignUpEmail() {
	const router = useRouter()
	const [isPendingSubmit, setIsPendingSubmit] = useState(false)

	const { navigateTo } = useSignupTransition()

	const email = Cookies.get("reg-email")
	const form = useForm<z.infer<typeof formSchema>>({
		mode: "onChange",
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: email ?? ""
		}
	})

	const handleOnSubmit: FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault()
		setIsPendingSubmit(true)
		form.handleSubmit(
			(formData) => {
				Cookies.set("reg-email", formData.email)
				navigateTo("/sign-up/username")
			},
			(errors) => {
				setIsPendingSubmit(false)
				toast.error(errors.email?.message)
			}
		)()
	}
	return (
		<form className="w-full" onSubmit={handleOnSubmit}>
			<CardHeader>Email</CardHeader>
			<CardContent className="flex flex-col">
				<FieldGroup>
					<Controller
						control={form.control}
						name="email"
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel>Email</FieldLabel>
								<Input
									autoFocus
									inputMode="email"
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
			<AlertDialog>
				<CardFooter className="flex justify-end justify-self-end">
					<Button disabled={isPendingSubmit}>
						Next
						{isPendingSubmit ? (
							<ReloadIcon className="ml-2 h-4 w-4 animate-spin" />
						) : (
							<ChevronRight className="ml-2" />
						)}
					</Button>
				</CardFooter>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Exit Registration</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to exit the registration page? Doing so will
							reset all data previously entered.
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
	)
}
