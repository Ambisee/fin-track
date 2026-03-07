"use client"

import { Button } from "@/components/ui/button"
import { CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel
} from "@/components/ui/field"
import { MAX_USERNAME_LENGTH } from "@/lib/constants"
import { getUsernameFromEmail } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeftIcon, ReloadIcon } from "@radix-ui/react-icons"
import Cookies from "js-cookie"
import { ChevronRight } from "lucide-react"
import { FormEventHandler, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { useSignupTransition } from "../layout"

const formSchema = z.object({
	username: z
		.string()
		.max(
			MAX_USERNAME_LENGTH,
			`Must be at most ${MAX_USERNAME_LENGTH} characters`
		)
		.regex(/(^$)|(^[a-zA-Z0-9]+$)/, "Must only contain alphanumeric characters")
		.default("")
})

export default function SignUpUsername() {
	const [isPendingSubmit, setIsPendingSubmit] = useState(false)

	const { navigateTo } = useSignupTransition()

	const email = Cookies.get("reg-email") as string
	const username = Cookies.get("reg-username")
	const getDefaultUsername = () => {
		if (username === undefined || username === getUsernameFromEmail(email)) {
			return ""
		}

		return username
	}

	const form = useForm<z.infer<typeof formSchema>>({
		mode: "onChange",
		resolver: zodResolver(formSchema),
		criteriaMode: "all",
		defaultValues: {
			username: getDefaultUsername()
		}
	})

	const handleOnSubmit: FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault()
		form.handleSubmit((formData) => {
			setIsPendingSubmit(true)
			let username = getUsernameFromEmail(email)
			if (formData.username !== "") {
				username = formData.username
			}

			setIsPendingSubmit(false)
			Cookies.set("reg-username", username)
			navigateTo("/sign-up/password")
		})()
	}

	return (
		<form className="w-full h-full" onSubmit={handleOnSubmit}>
			<CardHeader>Username (Optional)</CardHeader>
			<CardContent className="flex flex-col">
				<FieldGroup>
					<Controller
						control={form.control}
						name="username"
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel>Username</FieldLabel>
								<Input
									autoFocus
									placeholder={getUsernameFromEmail(email as string)}
									aria-invalid={fieldState.invalid}
									{...field}
								/>
								<div className="min-h-5 min-w-1">
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
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
					className="aspect-square p-0 flex gap-2"
					type="button"
					onClick={() => {
						navigateTo("/sign-up/email")
					}}
				>
					<ArrowLeftIcon />
				</Button>
				<Button disabled={isPendingSubmit}>
					Next
					{isPendingSubmit ? (
						<ReloadIcon className="ml-2 h-4 w-4 animate-spin" />
					) : (
						<ChevronRight className="ml-2" />
					)}
				</Button>
			</CardFooter>
		</form>
	)
}
