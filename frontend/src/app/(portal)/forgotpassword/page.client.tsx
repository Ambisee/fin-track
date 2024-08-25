"use client"

import { Button, buttonVariants } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader
} from "@/components/ui/card"
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { sbBrowser } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { ReloadIcon } from "@radix-ui/react-icons"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const formSchema = z.object({
	email: z.string().email("Please provide a valid email address")
})

export default function ForgotPassword() {
	const { toast } = useToast()
	const rootRef = useRef<HTMLDivElement>(null)
	const [isPendingSubmit, setIsPendingSubmit] = useState(false)
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: ""
		}
	})

	useEffect(() => {
		const resizeObserver = new ResizeObserver((entries) => {
			if (rootRef.current === undefined || rootRef.current === null) {
				return
			}
			rootRef.current.style.minHeight = `${window.innerHeight}px`
		})

		resizeObserver.observe(document.body)

		return () => {
			resizeObserver.disconnect()
		}
	}, [])

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
						<Form {...form}>
							<form
								className="grid gap-4"
								onSubmit={(e) => {
									e.preventDefault()
									form.handleSubmit(
										async (formData) => {
											setIsPendingSubmit(true)
											const { data, error } =
												await sbBrowser.auth.resetPasswordForEmail(
													formData.email,
													{
														redirectTo: `${window.location.origin}/recovery`
													}
												)
											if (error !== null) {
												setIsPendingSubmit(false)
												toast({
													description: error?.message,
													variant: "destructive",
													duration: 1500
												})
												return
											}

											setIsPendingSubmit(false)
											toast({
												description:
													"Please check your inbox for a link to reset your password.",
												duration: 1500
											})
										},
										(errors) => {}
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
												<Input
													inputMode="email"
													placeholder="Email"
													{...field}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
								<Button disabled={isPendingSubmit}>
									{isPendingSubmit && (
										<ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
									)}
									Submit
								</Button>
							</form>
						</Form>
						<Separator className="w-full mt-4" />
						<div className="text-center">
							<span className="text-sm">Remember your password?</span>
							<br />
							<Link
								href="/signin/email"
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
