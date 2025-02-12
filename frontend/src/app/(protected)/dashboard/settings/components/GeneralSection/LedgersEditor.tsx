"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import DialogPagesProvider, {
	useDialogPages
} from "@/components/user/DialogPagesProvider"
import LedgerGroup from "@/components/user/LedgerGroup"
import { LEDGER_QKEY, USER_SETTINGS_QKEY } from "@/lib/constants"
import { useSettingsQuery, useUserQuery } from "@/lib/hooks"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

export default function LedgersEditor() {
	const { toast } = useToast()
	const [open, setOpen] = useState(false)

	const userQuery = useUserQuery()
	const settingsQuery = useSettingsQuery()

	const queryClient = useQueryClient()

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<div id="ledgers-editor" className="grid pt-4 mt-4">
				<Label className="text-sm">Ledgers</Label>
				<div className="mt-2 p-4 rounded-md border">
					<div className="flex justify-between items-center">
						<span className="text-md text-muted-foreground">
							Current ledger
						</span>
						{userQuery.isLoading || settingsQuery.isLoading ? (
							<Skeleton className="rounded-full h-8" />
						) : (
							<span className="text-sm bg-secondary text-secondary-foreground rounded-full py-0.5 px-6">
								{settingsQuery.data?.data?.ledger?.name}
							</span>
						)}
					</div>
					<div className="flex mt-4">
						{userQuery.isLoading || settingsQuery.isLoading ? (
							<Skeleton className="w-full h-10" />
						) : (
							<DialogTrigger className="w-full" asChild>
								<Button>Select or edit your ledgers</Button>
							</DialogTrigger>
						)}
					</div>
				</div>
				<DialogContent
					hideCloseButton
					onSubmit={(e) => e.stopPropagation()}
					className="auto-rows-fr h-dvh max-w-none duration-0 border-0 sm:border sm:h-5/6 sm:min-h-[460px] sm:max-w-lg"
				>
					<LedgerGroup
						onCreate={() => {
							queryClient.invalidateQueries({ queryKey: LEDGER_QKEY })
						}}
						onUpdate={() => {
							queryClient.invalidateQueries({ queryKey: LEDGER_QKEY })
						}}
						onDelete={() => {
							queryClient.invalidateQueries({ queryKey: LEDGER_QKEY })
						}}
						onSelect={(ledger) => {
							setOpen(false)
							queryClient.invalidateQueries({
								queryKey: USER_SETTINGS_QKEY
							})

							toast({
								description: (
									<>
										Switched to the ledger: <b>{ledger.name}</b>
									</>
								),
								duration: 1500
							})
						}}
					/>
				</DialogContent>
			</div>
		</Dialog>
	)
}
