import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
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
	FieldError,
	FieldGroup,
	FieldLabel
} from "@/components/ui/field"

const emailChangeFormSchema = z.object({
	email: z.string().email("Please provide a valid email").default("")
})

export default function EmailChange() {
	const userQuery = useUserQuery()
	const [isPendingSubmit, setIsPendingSubmit] = useState(false)
	const form = useForm<z.infer<typeof emailChangeFormSchema>>({
		resolver: zodResolver(emailChangeFormSchema),
		defaultValues: {
			email: ""
		}
	})

	return (
		<form
			className="mt-8"
			onSubmit={(e) => {
				e.preventDefault()
				setIsPendingSubmit(true)
				form.handleSubmit(
					async (d) => {
						const { error } = await sbBrowser.auth.updateUser(
							{ email: d.email },
							{ emailRedirectTo: window.location.origin }
						)

						if (error !== null) {
							toast.error(error.message, { duration: SHORT_TOAST_DURATION })
							setIsPendingSubmit(false)
							return
						}

						setIsPendingSubmit(false)
						toast.info(
							"Please check your previous and new email's inbox to continue with the process."
						)
					},
					() => {
						setIsPendingSubmit(false)
					}
				)()
			}}
		>
			<FieldGroup>
				<Controller
					control={form.control}
					name="email"
					render={({ field, fieldState }) => (
						<Field className="w-full" data-invalid={fieldState.invalid}>
							<FieldLabel>Email</FieldLabel>
							{userQuery.isLoading ? (
								<InputSkeleton />
							) : (
								<Input
									{...field}
									aria-invalid={fieldState.invalid}
									placeholder={userQuery.data?.email}
								/>
							)}
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
				/>
			</FieldGroup>
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
	)
}
