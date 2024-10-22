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
import { useSettingsQuery } from "@/lib/hooks"
import { sbBrowser } from "@/lib/supabase"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import SettingsSection from "../SettingsSection"

const mailingSectionFormSchema = z.object({
	allowReport: z.boolean()
})

export default function MailingSection() {
	const { toast } = useToast()
	const [isPendingSubmit, setIsPendingSubmit] = useState(false)
	const userSettingsQuery = useSettingsQuery()

	const form = useForm<z.infer<typeof mailingSectionFormSchema>>({
		resolver: zodResolver(mailingSectionFormSchema),
		values: {
			allowReport: userSettingsQuery.data?.data?.allow_report ?? false
		}
	})

	return (
		<SettingsSection name="Mailing">
			<Form {...form}>
				<form
					onSubmit={(e) => {
						e.preventDefault()
						form.handleSubmit(async (formData) => {
							setIsPendingSubmit(true)
							const { error } = await sbBrowser
								.from("settings")
								.update({ allow_report: formData.allowReport })
								.eq("user_id", userSettingsQuery.data?.data?.user_id as string)

							if (error !== null) {
								toast({
									description: error.message,
									variant: "destructive",
									duration: 1500
								})
								return
							}

							toast({
								description: "New settings data saved.",
								duration: 1500
							})
						})()
					}}
				>
					<FormField
						control={form.control}
						name="allowReport"
						render={({ field }) => (
							<FormItem className="flex flex-row gap-4 justify-between items-center space-y-0">
								<div>
									<FormLabel>Monthly reports</FormLabel>
									<FormDescription>
										Send monthly transaction reports to the inbox.
									</FormDescription>
								</div>
								<FormControl>
									{userSettingsQuery.isLoading ? (
										<Skeleton className="h-6 w-11 rounded-full" />
									) : (
										<Switch
											className="m-0"
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									)}
								</FormControl>
							</FormItem>
						)}
					/>
					<Button className="mt-4" disabled={userSettingsQuery.isLoading}>
						Save Settings
					</Button>
				</form>
			</Form>
		</SettingsSection>
	)
}
