import { Button } from "@/components/ui/button"
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel
} from "@/components/ui/form"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { SHORT_TOAST_DURATION } from "@/lib/constants"
import { useSettingsQuery, useUserQuery } from "@/lib/hooks"
import { sbBrowser } from "@/lib/supabase"
import { zodResolver } from "@hookform/resolvers/zod"
import { ReloadIcon } from "@radix-ui/react-icons"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const mailingSectionFormSchema = z.object({
	allowReport: z.boolean()
})

export default function AutomaticMonthlyReport() {
	const { toast } = useToast()
	const [isPendingSubmit, setIsPendingSubmit] = useState(false)

	const userQuery = useUserQuery()
	const userSettingsQuery = useSettingsQuery()

	const form = useForm<z.infer<typeof mailingSectionFormSchema>>({
		resolver: zodResolver(mailingSectionFormSchema),
		values: {
			allowReport: userSettingsQuery.data?.allow_report ?? false
		}
	})

	return (
		<Form {...form}>
			<form
				onSubmit={(e) => {
					e.preventDefault()
					form.handleSubmit(async (formData) => {
						setIsPendingSubmit(true)
						const { error } = await sbBrowser
							.from("settings")
							.update({ allow_report: formData.allowReport })
							.eq("user_id", userSettingsQuery.data?.user_id as string)

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
							description: "New settings data saved.",
							duration: SHORT_TOAST_DURATION
						})
					})()
				}}
			>
				<FormField
					control={form.control}
					name="allowReport"
					render={({ field }) => (
						<FormItem className="flex gap-4 items-center space-y-0">
							<div>
								<FormLabel>Automatic Monthly Report</FormLabel>
								<FormDescription>
									Allow the app to send automatic transaction reports every
									month.
								</FormDescription>
							</div>
							<FormControl>
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
							</FormControl>
						</FormItem>
					)}
				/>
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
		</Form>
	)
}
