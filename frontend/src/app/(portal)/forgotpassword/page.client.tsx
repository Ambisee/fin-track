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
import { sbBrowser } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import Image from "next/image"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { z } from "zod"

const formSchema = z.object({
	email: z.string().email("Please provide a valid email address")
})

export default function ForgotPassword() {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: ""
		}
	})

	return (
		<div className="w-full min-h-[inherit] grid grid-flow-col-dense justify-items-center">
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
											const { data, error } =
												await sbBrowser.auth.resetPasswordForEmail(
													formData.email
												)
											if (error !== null) {
											}
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
								<Button>Submit</Button>
							</form>
						</Form>
						<Separator className="w-full mt-4" />
						<div className="text-center">
							<span className="text-sm text-muted">
								Remember your password?{" "}
							</span>
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
