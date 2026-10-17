"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { toast } from "sonner"
import PasswordField from "@/components/user/PasswordField"
import { USER_QKEY } from "@/lib/constants"
import { supabaseClient } from "@/lib/supabase"
import { zodResolver } from "@hookform/resolvers/zod"
import { ReloadIcon } from "@radix-ui/react-icons"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel
} from "@/components/ui/field"
import { z } from "zod"

const recoveryFormSchema = z
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

export default function Recovery() {
	const router = useRouter()

	const [supabase] = useState(supabaseClient())
	const [isFormLoading, setIsPendingSubmit] = useState(false)

	const queryClient = useQueryClient()
	const form = useForm<z.infer<typeof recoveryFormSchema>>({
		resolver: zodResolver(recoveryFormSchema),
		defaultValues: {
			password: "",
			confirmPassword: ""
		}
	})
	return (
		<div className="w-full min-h-screen grid grid-flow-col-dense justify-items-center">
			<div className="w-full max-w-container flex justify-center items-center">
				<Card className="w-full max-w-[360px] grid grid-flow-row">
					<form
						className="w-full h-full"
						onSubmit={(e) => {
							e.preventDefault()
							form.handleSubmit(
								async (formData) => {
									setIsPendingSubmit(true)
									const { error } = await supabase.auth.updateUser({
										password: formData.password
									})

									if (error !== null) {
										setIsPendingSubmit(false)
										toast.error(error.message)
										return
									}

									toast.info("Successfully changed the password")
									await supabase.auth.signOut()
									queryClient.invalidateQueries({ queryKey: USER_QKEY })
									router.push("/sign-in/email")
								},
								() => {}
							)()
						}}
					>
						<CardHeader>Reset Password</CardHeader>
						<CardContent className="flex flex-col md:justify-start justify-end gap-4">
							<FieldGroup>
								<Controller
									control={form.control}
									name="password"
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel>Password</FieldLabel>
											<PasswordField
												autoFocus
												placeholder="Password"
												aria-invalid={fieldState.invalid}
												{...field}
											/>
											<div className="min-h-5 min-w-1">
												{fieldState.invalid && (
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
											<FieldLabel>Confirm Password</FieldLabel>
											<PasswordField
												placeholder="Confirm Password"
												aria-invalid={fieldState.invalid}
												{...field}
											/>
											<div className="min-h-5 min-w-1">
												{fieldState.invalid && (
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
						<CardFooter>
							<Button className="w-full" disabled={isFormLoading}>
								{isFormLoading && (
									<ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
								)}
								{isFormLoading ? "Loading" : "Submit"}
							</Button>
						</CardFooter>
					</form>
				</Card>
			</div>
		</div>
	)
}
