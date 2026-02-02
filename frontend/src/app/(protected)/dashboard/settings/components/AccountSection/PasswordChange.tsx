import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import PasswordField from "@/components/user/PasswordField"
import { SHORT_TOAST_DURATION } from "@/lib/constants"
import { useUserQuery } from "@/lib/hooks"
import { sbBrowser } from "@/lib/supabase"
import { zodResolver } from "@hookform/resolvers/zod"
import { ReloadIcon } from "@radix-ui/react-icons"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import InputSkeleton from "../InputSkeleton"
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup
} from "@/components/ui/field"

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
		const identities = userQuery.data?.identities
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
								userQuery.data?.email as string,
								{
									redirectTo: `${window.location.origin}/recovery`
								}
							)

							if (error !== null) {
								toast({
									description: error.message,
									variant: "destructive",
									duration: SHORT_TOAST_DURATION
								})
								return
							}

							toast({
								description:
									"Please check your inbox for a link to reset your password.",
								duration: SHORT_TOAST_DURATION
							})
						}}
					>
						Reset Password
					</Button>
				</div>
			)
		}

		return (
			<FieldGroup>
				<Controller
					control={form.control}
					name="oldPassword"
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid} className="-mb-4">
							<PasswordField
								aria-invalid={fieldState.invalid}
								placeholder="Old password"
								{...field}
							/>
						</Field>
					)}
				/>
				<Controller
					control={form.control}
					name="newPassword"
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<Field>
								<PasswordField placeholder="New password" {...field} />
							</Field>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
							<FieldDescription>
								Passwords must have at least 8 characters and include lowercase,
								uppercase, number, and special characters.
							</FieldDescription>
						</Field>
					)}
				/>
				<Controller
					control={form.control}
					name="confirmNewPassword"
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<Field>
								<PasswordField placeholder="Confirm new password" {...field} />
							</Field>
							{form.formState.errors.confirmNewPassword && (
								<div className="text-sm font-medium text-destructive">
									{form.formState.errors.confirmNewPassword.message}
								</div>
							)}
						</Field>
					)}
				/>
				<div className="flex justify-between items-center">
					<Button disabled={userQuery.isLoading || isPendingSubmit}>
						Submit
						{isPendingSubmit && (
							<ReloadIcon className="ml-2 h-4 w-4 animate-spin" />
						)}
					</Button>
					<Button
						onClick={async () => {
							if (userQuery.data?.email === undefined) {
								return
							}

							const { error } = await sbBrowser.auth.resetPasswordForEmail(
								userQuery.data.email
							)

							if (error !== null) {
								toast({
									description: error?.message,
									variant: "destructive",
									duration: SHORT_TOAST_DURATION
								})
								return
							}

							toast({
								description:
									"Please check your inbox and follow the instructions to reset your password.",
								duration: SHORT_TOAST_DURATION
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
			</FieldGroup>
		)
	}

	return (
		<form
			className="mt-8"
			onSubmit={(e) => {
				e.preventDefault()
				form.handleSubmit(async (formData) => {
					setIsPendingSubmit(true)
					const { error } = await sbBrowser.rpc("update_password", {
						old_password: formData.oldPassword,
						new_password: formData.newPassword
					})

					if (error !== null) {
						setIsPendingSubmit(false)
						toast({
							description: error?.message,
							variant: "destructive",
							duration: SHORT_TOAST_DURATION
						})
						return
					}

					setIsPendingSubmit(false)

					toast({
						description: "Successfully updated the account's password",
						duration: SHORT_TOAST_DURATION
					})

					form.reset()
				})()
			}}
		>
			{renderFormFields()}
		</form>
	)
}
