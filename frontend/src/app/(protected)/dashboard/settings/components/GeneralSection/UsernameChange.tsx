import { Button } from "@/components/ui/button"
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import {
	MAX_USERNAME_LENGTH,
	SHORT_TOAST_DURATION,
	USER_QKEY,
	USER_SETTINGS_QKEY
} from "@/lib/constants"
import { useUserQuery } from "@/lib/hooks"
import { sbBrowser } from "@/lib/supabase"
import { zodResolver } from "@hookform/resolvers/zod"
import { ReloadIcon } from "@radix-ui/react-icons"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import InputSkeleton from "../InputSkeleton"

const formSchema = z.object({
	username: z
		.string()
		.regex(/^[A-Za-z0-9]+$/, "Please enter only alphanumeric characters.")
})

export default function UsernameChange() {
	const [isPendingSubmit, setIsPendingSubmit] = useState(false)

	const { toast } = useToast()
	const userQuery = useUserQuery()
	const queryClient = useQueryClient()
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			username: ""
		}
	})

	return (
		<>
			<form
				onSubmit={form.handleSubmit(async (data) => {
					setIsPendingSubmit(true)
					if (data.username === "") {
						toast({
							description: "Please enter a valid username.",
							variant: "destructive"
						})
						setIsPendingSubmit(false)
						return
					}

					if (data.username === userQuery.data?.user_metadata["username"]) {
						toast({
							description: "Please enter a different username.",
							variant: "destructive"
						})
						setIsPendingSubmit(false)
						return
					}

					const { error } = await sbBrowser.auth.updateUser({
						data: {
							username: data.username
						}
					})

					if (error !== null) {
						toast({
							title: error.message,
							variant: "destructive",
							duration: SHORT_TOAST_DURATION
						})
						setIsPendingSubmit(false)

						return
					}

					queryClient
						.invalidateQueries({ queryKey: USER_QKEY })
						.then(() => form.reset())
					queryClient.invalidateQueries({ queryKey: USER_SETTINGS_QKEY })
					setIsPendingSubmit(false)

					toast({
						description: "Username updated",
						duration: SHORT_TOAST_DURATION
					})
				})}
			>
				<FieldGroup>
					<Controller
						control={form.control}
						name="username"
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor="username-field" className="text-sm">
									Username
								</FieldLabel>
								{userQuery.isLoading ? (
									<InputSkeleton />
								) : (
									<Input
										{...field}
										id="username-field"
										className="w-full"
										placeholder={userQuery.data?.user_metadata["username"]}
										aria-invalid={fieldState.invalid}
									/>
								)}
								{fieldState.invalid && (
									<FieldError
										className="min-h-5 min-w-1 text-sm font-medium text-destructive"
										errors={[fieldState.error]}
									/>
								)}
								{userQuery.isLoading ? (
									<Skeleton className="h-6 w-full max-w-40" />
								) : (
									<FieldDescription>
										Usernames must only contain alphanumeric characters and at
										most {MAX_USERNAME_LENGTH} characters
									</FieldDescription>
								)}
							</Field>
						)}
					/>
				</FieldGroup>
				<Button
					type="submit"
					className="mt-6"
					variant="default"
					disabled={userQuery.isLoading || isPendingSubmit}
				>
					Save Settings
					{isPendingSubmit && (
						<ReloadIcon className="ml-2 h-4 w-4 animate-spin" />
					)}
				</Button>
			</form>
		</>
	)
}
