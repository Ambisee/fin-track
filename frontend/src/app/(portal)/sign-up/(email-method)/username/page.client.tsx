"use client"

import { Button } from "@/components/ui/button"
import { CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { MAX_USERNAME_LENGTH } from "@/lib/constants"
import { getUsernameFromEmail } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import {
	ArrowLeftIcon,
	ArrowRightIcon,
	ReloadIcon
} from "@radix-ui/react-icons"
import Cookies from "js-cookie"
import { ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

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
	const router = useRouter()
	const [isPendingSubmit, setIsPendingSubmit] = useState(false)

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

	return (
		<Form {...form}>
			<form
				className="w-full h-full"
				onSubmit={(e) => {
					e.preventDefault()
					setIsPendingSubmit(true)
					form.handleSubmit((formData) => {
						let username = getUsernameFromEmail(email)
						if (formData.username !== "") {
							username = formData.username
						}

						Cookies.set("reg-username", username)
						router.replace("/sign-up/password")
					})()
				}}
			>
				<CardHeader>Username (Optional)</CardHeader>
				<CardContent className="flex flex-col">
					<FormField
						control={form.control}
						name="username"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Input
										autoFocus
										placeholder={getUsernameFromEmail(email as string)}
										{...field}
									/>
								</FormControl>
								<div className="min-h-5 min-w-1 text-sm font-medium text-destructive">
									{form.formState.errors.username?.message}
								</div>
							</FormItem>
						)}
					/>
				</CardContent>
				<CardFooter className="flex justify-between">
					<Button
						variant="ghost"
						className="aspect-square p-0 flex gap-2"
						type="button"
						onClick={(e) => {
							router.replace("/sign-up/email")
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
		</Form>
	)
}
