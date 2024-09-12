"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem
} from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"
import PasswordField from "@/components/user/PasswordField"
import { USER_QKEY } from "@/lib/constants"
import { sbBrowser } from "@/lib/supabase"
import { zodResolver } from "@hookform/resolvers/zod"
import { ReloadIcon } from "@radix-ui/react-icons"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
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
	const { toast } = useToast()
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
					<Form {...form}>
						<form
							className="w-full h-full"
							onSubmit={(e) => {
								e.preventDefault()
								form.handleSubmit(
									async (formData) => {
										setIsPendingSubmit(true)
										const { data, error } = await sbBrowser.auth.updateUser({
											password: formData.password
										})

										if (error !== null) {
											setIsPendingSubmit(false)
											toast({
												description: error.message,
												variant: "destructive"
											})
											return
										}

										toast({
											description: "Successfully changed the password"
										})
										await sbBrowser.auth.signOut()
										queryClient.invalidateQueries({ queryKey: USER_QKEY })
										router.push("/sign-in/email")
									},
									(error) => {}
								)()
							}}
						>
							<CardHeader>Reset Password</CardHeader>
							<CardContent className="flex flex-col md:justify-start justify-end gap-4">
								<FormField
									control={form.control}
									name="password"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<PasswordField
													autoFocus
													placeholder="Password"
													{...field}
												/>
											</FormControl>
											<div className="min-h-5 min-w-1 text-sm font-medium text-destructive">
												{form.formState.errors.password?.message}
											</div>
											<FormDescription>
												Passwords must have at least 8 characters and include
												lowercase, uppercase, number, and special characters.
											</FormDescription>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="confirmPassword"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<PasswordField
													placeholder="Confirm Password"
													{...field}
												/>
											</FormControl>
											<div className="min-h-5 min-w-1 text-sm font-medium text-destructive">
												{form.formState.errors.confirmPassword?.message}
											</div>
										</FormItem>
									)}
								/>
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
					</Form>
				</Card>
			</div>
		</div>
	)
}
