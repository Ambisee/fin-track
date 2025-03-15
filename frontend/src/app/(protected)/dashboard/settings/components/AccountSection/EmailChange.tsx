import { z } from "zod"
import {
	Form,
	FormControl,
	FormItem,
	FormDescription,
	FormLabel,
	FormField,
	FormMessage
} from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"
import { useUserQuery } from "@/lib/hooks"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { sbBrowser } from "@/lib/supabase"
import InputSkeleton from "../InputSkeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { ReloadIcon } from "@radix-ui/react-icons"
import { SHORT_TOAST_DURATION } from "@/lib/constants"

const emailChangeFormSchema = z.object({
	email: z.string().email("Please provide a valid email").default("")
})

export default function EmailChange() {
	const { toast } = useToast()
	const userQuery = useUserQuery()
	const [isPendingSubmit, setIsPendingSubmit] = useState(false)
	const form = useForm<z.infer<typeof emailChangeFormSchema>>({
		resolver: zodResolver(emailChangeFormSchema),
		defaultValues: {
			email: ""
		}
	})

	return (
		<Form {...form}>
			<form
				className="mt-8"
				onSubmit={(e) => {
					e.preventDefault()
					setIsPendingSubmit(true)
					form.handleSubmit(
						async (d) => {
							const { data, error } = await sbBrowser.auth.updateUser(
								{
									email: d.email
								},
								{
									emailRedirectTo: window.location.origin
								}
							)

							if (error !== null) {
								toast({
									description: error.message,
									variant: "destructive",
									duration: SHORT_TOAST_DURATION
								})
								setIsPendingSubmit(false)
								return
							}

							setIsPendingSubmit(false)
							toast({
								description:
									"Please check your previous and new email's inbox to verify the email change."
							})
						},
						(errors) => {
							setIsPendingSubmit(false)
						}
					)()
				}}
			>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem className="w-full">
							<FormLabel>Email</FormLabel>
							<FormControl>
								{userQuery.isLoading ? (
									<InputSkeleton />
								) : (
									<Input
										placeholder={userQuery.data?.data.user?.email}
										{...field}
									/>
								)}
							</FormControl>
							{form.formState.errors.email && (
								<FormMessage>{form.formState.errors.email.message}</FormMessage>
							)}
						</FormItem>
					)}
				/>
				<Button
					disabled={userQuery.isLoading || isPendingSubmit}
					className="mt-6"
				>
					Submit
					{isPendingSubmit && (
						<ReloadIcon className="ml-2 h-4 w-4 animate-spin" />
					)}
				</Button>
			</form>
		</Form>
	)
}
