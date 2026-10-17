"use client"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel
} from "@/components/ui/field"
import { toast } from "sonner"
import { SHORT_TOAST_DURATION } from "@/lib/constants"
import { useSetElementWindowHeight } from "@/lib/hooks"
import { supabaseClient } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { ReloadIcon } from "@radix-ui/react-icons"
import Link from "next/link"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

const formSchema = z.object({
	email: z.string().email("Please provide a valid email address")
})

export default function ForgotPassword() {
	const rootRef = useSetElementWindowHeight()
	const [supabase] = useState(supabaseClient())
	const [isPendingSubmit, setIsPendingSubmit] = useState(false)
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: ""
		}
	})

	return (
		<div
			ref={rootRef}
			className="w-full min-h-screen grid grid-flow-col-dense justify-items-center"
		>
			<div className="w-full max-w-container flex justify-center items-center">
				<Card className="w-[320px]">
					<CardHeader className="w-full text-center">
						Enter your email to reset your password
					</CardHeader>
					<CardContent className="w-full grid grid-flow-row gap-4">
						<form
							className="grid gap-4"
							onSubmit={(e) => {
								e.preventDefault()
								form.handleSubmit(
									async (formData) => {
										setIsPendingSubmit(true)
										const { error } = await supabase.auth.resetPasswordForEmail(
											formData.email,
											{
												redirectTo: `${window.location.origin}/recovery`
											}
										)
										if (error !== null) {
											setIsPendingSubmit(false)
											toast.error(error?.message, {
												duration: SHORT_TOAST_DURATION
											})
											return
										}

										setIsPendingSubmit(false)
										toast.info(
											"Please check your inbox and follow the instructions to reset your password.",
											{ duration: SHORT_TOAST_DURATION }
										)
									},
									() => {}
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
												{...field}
												aria-invalid={fieldState.invalid}
											/>
											{fieldState.invalid && (
												<FieldError errors={[fieldState.error]} />
											)}
										</Field>
									)}
								/>
							</FieldGroup>
							<Button disabled={isPendingSubmit}>
								{isPendingSubmit && (
									<ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
								)}
								Submit
							</Button>
						</form>
						<Separator className="w-full mt-4" />
						<div className="text-center">
							<span className="text-sm">Remember your password?</span>
							<br />
							<Link
								href="/sign-in/email"
								className={cn(buttonVariants({ variant: "link" }), "p-0 h-fit")}
							>
								Sign in
							</Link>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
