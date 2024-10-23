import { useToast } from "@/components/ui/use-toast"
import { useUserQuery } from "@/lib/hooks"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import InputSkeleton from "../InputSkeleton"
import { Skeleton } from "@/components/ui/skeleton"
import { Button, buttonVariants } from "@/components/ui/button"
import { sbBrowser } from "@/lib/supabase"
import {
	FormControl,
	FormField,
	FormLabel,
	FormDescription,
	FormItem,
	Form
} from "@/components/ui/form"
import { z } from "zod"
import PasswordField from "@/components/user/PasswordField"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { ReloadIcon } from "@radix-ui/react-icons"

const passwordChangeFormSchema = z
	.object({
		oldPassword: z.string(),
		newPassword: z
			.string()
			.min(8, "Must be at least 8 characters long")
			.regex(/.*[A-Z].*/, "Must contain at least one uppercase letter")
			.regex(/.*[a-z].*/, "Must contain at least one lowercase letter")
			.regex(/.*[0-9].*/, "Must contain at least one digit")
			.regex(
				/.*[!@#\$%^&*()_+{}\[\]:;<>,.?~].*/,
				"Must contain at least one special character"
			),
		confirmNewPassword: z.string()
	})
	.refine((data) => data.confirmNewPassword === data.newPassword, {
		message: "New passwords do not match",
		path: ["confirmNewPassword"]
	})

export default function PasswordChange() {
	const { toast } = useToast()
	const [isPendingSubmit, setIsPendingSubmit] = useState(false)

	const userQuery = useUserQuery()

	const form = useForm<z.infer<typeof passwordChangeFormSchema>>({
		mode: "onChange",
		resolver: zodResolver(passwordChangeFormSchema),
		defaultValues: {
			oldPassword: "",
			newPassword: "",
			confirmNewPassword: ""
		}
	})

	const getUserIdentities = () => {
		const result = new Set()
		const identities = userQuery.data?.data.user?.identities
		if (identities === undefined) {
			return result
		}

		for (const identity of identities) {
			result.add(identity.provider)
		}

		return result
	}

	const renderFormFields = () => {
		if (userQuery.isLoading) {
			return (
				<>
					<InputSkeleton className="mt-2" />
					<InputSkeleton className="mt-2" />
					<Skeleton className="h-16 mt-2" />
					<InputSkeleton className="mt-2" />
				</>
			)
		}

		const identities = getUserIdentities()
		if (!identities.has("email")) {
			return (
				<div className="mt-2">
					<p className="text-sm text-muted-foreground">
						This account was created through Google. You can enable sign-in
						through password by resetting your password.
					</p>
					<Button
						className="mt-4"
						type="button"
						onClick={async (e) => {
							e.preventDefault()
							const { error } = await sbBrowser.auth.resetPasswordForEmail(
								userQuery.data?.data.user?.email as string,
								{
									redirectTo: `${window.location.origin}/recovery`
								}
							)

							if (error !== null) {
								toast({
									description: error.message,
									variant: "destructive",
									duration: 1500
								})
								return
							}

							toast({
								description:
									"Please check your inbox for a link to reset your password.",
								duration: 1500
							})
						}}
					>
						Reset Password
					</Button>
				</div>
			)
		}

		return (
			<>
				<FormField
					control={form.control}
					name="oldPassword"
					render={({ field }) => (
						<FormItem className="mt-2">
							<FormControl>
								<PasswordField placeholder="Old password" {...field} />
							</FormControl>
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="newPassword"
					render={({ field }) => (
						<FormItem className="mt-2">
							<FormControl>
								<PasswordField placeholder="New password" {...field} />
							</FormControl>
							{form.formState.errors.newPassword && (
								<div className="min-h-5 min-w-1 text-sm font-medium text-destructive">
									{form.formState.errors.newPassword.message}
								</div>
							)}
							<FormDescription>
								Passwords must have at least 8 characters and include lowercase,
								uppercase, number, and special characters.
							</FormDescription>
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="confirmNewPassword"
					render={({ field }) => (
						<FormItem className="mt-4">
							<FormControl>
								<PasswordField placeholder="Confirm new password" {...field} />
							</FormControl>
							{form.formState.errors.confirmNewPassword && (
								<div className="text-sm font-medium text-destructive">
									{form.formState.errors.confirmNewPassword.message}
								</div>
							)}
						</FormItem>
					)}
				/>
			</>
		)
	}

	return (
		<Form {...form}>
			<form
				className="mt-8"
				onSubmit={(e) => {
					e.preventDefault()
					form.handleSubmit(async (formData) => {
						setIsPendingSubmit(true)
						const { data, error } = await sbBrowser.rpc("update_password", {
							old_password: formData.oldPassword,
							new_password: formData.newPassword
						})

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
							description: "Successfully updated the account's password",
							duration: 1500
						})

						form.reset()
					})()
				}}
			>
				<FormLabel>Password</FormLabel>
				{renderFormFields()}
				<div className="flex justify-between items-center mt-4">
					<Button disabled={userQuery.isLoading || isPendingSubmit}>
						Submit
						{isPendingSubmit && (
							<ReloadIcon className="ml-2 h-4 w-4 animate-spin" />
						)}
					</Button>
					<Button
						onClick={async () => {
							if (userQuery.data?.data.user?.email === undefined) {
								return
							}

							const { data, error } =
								await sbBrowser.auth.resetPasswordForEmail(
									userQuery.data.data.user.email
								)

							if (error !== null) {
								toast({
									description: error?.message,
									variant: "destructive",
									duration: 1500
								})
								return
							}

							toast({
								description:
									"Please check your inbox and follow the instructions to reset your password.",
								duration: 1500
							})
							return
						}}
						variant="link"
						type="button"
						className="h-fit p-0 m-0"
					>
						Request a password reset link
					</Button>
				</div>
			</form>
		</Form>
	)
}
