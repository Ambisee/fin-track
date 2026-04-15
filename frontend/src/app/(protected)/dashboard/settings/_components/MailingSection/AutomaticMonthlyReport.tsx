import { Button } from "@/components/ui/button"
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel
} from "@/components/ui/field"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { SHORT_TOAST_DURATION } from "@/lib/constants"
import { useSettingsQuery, useUserQuery } from "@/lib/hooks"
import { supabaseClient } from "@/lib/supabase"
import { zodResolver } from "@hookform/resolvers/zod"
import { ReloadIcon } from "@radix-ui/react-icons"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

const mailingSectionFormSchema = z.object({
	allowReport: z.boolean()
})

export default function AutomaticMonthlyReport() {
	const [isPendingSubmit, setIsPendingSubmit] = useState(false)
	const [supabase] = useState(supabaseClient())

	const userQuery = useUserQuery()
	const userSettingsQuery = useSettingsQuery()

	const form = useForm<z.infer<typeof mailingSectionFormSchema>>({
		resolver: zodResolver(mailingSectionFormSchema),
		values: {
			allowReport: userSettingsQuery.data?.allow_report ?? false
		}
	})

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault()
				form.handleSubmit(async (formData) => {
					setIsPendingSubmit(true)
					const { error } = await supabase
						.from("settings")
						.update({ allow_report: formData.allowReport })
						.eq("user_id", userSettingsQuery.data?.user_id as string)

					if (error !== null) {
						toast.error(error.message, { duration: SHORT_TOAST_DURATION })
						setIsPendingSubmit(false)
						return
					}

					setIsPendingSubmit(false)
					toast.info("New settings data saved.", {
						duration: SHORT_TOAST_DURATION
					})
				})()
			}}
		>
			<FieldGroup>
				<Controller
					control={form.control}
					name="allowReport"
					render={({ field, fieldState }) => (
						<Field
							className="flex gap-4 items-center space-y-0"
							data-invalid={fieldState.invalid}
						>
							<div>
								<FieldLabel>Automatic Monthly Report</FieldLabel>
								<FieldDescription>
									Allow the app to send automatic transaction reports every
									month.
								</FieldDescription>
							</div>
							<div className="w-11">
								{userQuery.isLoading || userSettingsQuery.isLoading ? (
									<Skeleton className="h-6 w-11 rounded-full" />
								) : (
									<Switch
										className="m-0"
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								)}
							</div>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
				/>
			</FieldGroup>
			<Button
				className="mt-4"
				disabled={userQuery.isLoading || isPendingSubmit}
			>
				Save Settings
				{isPendingSubmit && (
					<ReloadIcon className="ml-2 h-4 w-4 animate-spin" />
				)}
			</Button>
		</form>
	)
}
