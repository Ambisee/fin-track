import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import {
	CURRENCIES_QKEY,
	ENTRY_QKEY,
	SHORT_TOAST_DURATION,
	STATISTICS_QKEY,
	USER_QKEY,
	USER_SETTINGS_QKEY
} from "@/lib/constants"
import { sbBrowser } from "@/lib/supabase"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"
import SettingsSection from "../SettingsSection"

export default function MiscellaneousSection() {
	const router = useRouter()
	const { toast, dismiss } = useToast()
	const queryClient = useQueryClient()
	const [isDeleteChecked, setIsDeleteChecked] = useState(false)

	return (
		<SettingsSection className="mb-0" name="Miscellaneous">
			<>
				<AlertDialog>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Warning</AlertDialogTitle>
							<AlertDialogDescription>
								<p>
									This action will permanently removes all of your data from our
									servers. You will not be able to sign in and view your
									transaction records after this action is completed.
								</p>
								<div className="mt-4 mb-4 flex items-start gap-2 text-left md:mt-2 md:items-center">
									<Checkbox
										id="delete-confirmation"
										className="mt-[0.125rem] md:mt-0"
										checked={isDeleteChecked}
										onCheckedChange={() => setIsDeleteChecked((c) => !c)}
									/>
									<label htmlFor="delete-confirmation">
										I understand and would like to proceed with the action.
									</label>
								</div>
							</AlertDialogDescription>
							<AlertDialogFooter>
								<AlertDialogCancel onClick={() => setIsDeleteChecked(false)}>
									Cancel
								</AlertDialogCancel>
								<AlertDialogAction
									variant="destructive"
									disabled={!isDeleteChecked}
									onClick={async () => {
										toast({
											description: "Loading..."
										})

										const response = await fetch("/auth/user", {
											method: "DELETE"
										})

										if (response.status !== 200) {
											toast({
												description: (await response.json()).message,
												variant: "destructive",
												duration: SHORT_TOAST_DURATION
											})
											return
										}

										toast({
											description:
												"Successfully deleted your account. Redirecting to the home page...",
											duration: 2500
										})
										router.push("/")
									}}
								>
									Delete account
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogHeader>
					</AlertDialogContent>
					<div className="mb-4">
						<span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
							Account Deletion
						</span>
						<br />
						<AlertDialogTrigger asChild>
							<Button className="mt-2" variant="destructive">
								Delete Account
							</Button>
						</AlertDialogTrigger>
					</div>
					<div>
						<span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
							Log out of your account
						</span>
						<br />
						<Button
							className="mt-2"
							variant="default"
							onClick={async () => {
								toast({ description: "Loading..." })
								const { error } = await sbBrowser.auth.signOut()

								if (error !== null) {
									toast({ description: error.message })
								}

								queryClient.removeQueries({ queryKey: CURRENCIES_QKEY })
								queryClient.removeQueries({ queryKey: ENTRY_QKEY })
								queryClient.removeQueries({ queryKey: STATISTICS_QKEY })
								queryClient.removeQueries({ queryKey: USER_SETTINGS_QKEY })
								queryClient.removeQueries({ queryKey: USER_QKEY })

								router.push("/")
								dismiss()
							}}
						>
							Logout
						</Button>
					</div>
				</AlertDialog>
			</>
		</SettingsSection>
	)
}
