import {
	Form,
	FormField,
	FormLabel,
	FormItem,
	FormControl,
	FormDescription
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import InputSkeleton from "../InputSkeleton"
import {
	MAX_USERNAME_LENGTH,
	USER_QKEY,
	USER_SETTINGS_QKEY
} from "@/lib/constants"
import { useUserQuery } from "@/lib/hooks"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { ReloadIcon } from "@radix-ui/react-icons"
import { useState } from "react"
import { sbBrowser } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { formatRFC3339 } from "date-fns"
import { useQueryClient } from "@tanstack/react-query"

const formSchema = z.object({
	username: z.string()
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
		<Form {...form}>
			<form
				onSubmit={(e) => {
					e.preventDefault()
					form.handleSubmit(async (data) => {
						setIsPendingSubmit(true)
						if (data.username === "") {
							toast({
								description: "Please enter a valid username.",
								variant: "destructive"
							})
							setIsPendingSubmit(false)
							return
						}

						if (
							data.username ===
							userQuery.data?.data.user?.user_metadata["username"]
						) {
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
								duration: 1500
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
							duration: 1500
						})
					})()
				}}
			>
				<FormField
					control={form.control}
					name="username"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-sm">Username</FormLabel>
							<FormControl>
								{userQuery.isLoading ? (
									<InputSkeleton />
								) : (
									<Input
										className="w-full"
										placeholder={
											userQuery.data?.data.user?.user_metadata["username"]
										}
										{...field}
									/>
								)}
							</FormControl>
							{form.formState.errors.username?.message && (
								<div className="min-h-5 min-w-1 text-sm font-medium text-destructive">
									{form.formState.errors.username.message}
								</div>
							)}
							{userQuery.isLoading ? (
								<Skeleton className="h-6 w-full max-w-40" />
							) : (
								<FormDescription>
									Usernames must only contain alphanumeric characters and at
									most {MAX_USERNAME_LENGTH} characters
								</FormDescription>
							)}
						</FormItem>
					)}
				/>
				<Button
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
		</Form>
	)
}
