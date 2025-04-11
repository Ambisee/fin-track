"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import LedgerGroup from "@/components/user/LedgerGroup"
import { SHORT_TOAST_DURATION } from "@/lib/constants"
import { useSettingsQuery, useUserQuery } from "@/lib/hooks"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

export default function LedgersEditor() {
	const { toast } = useToast()
	const [open, setOpen] = useState(false)

	const userQuery = useUserQuery()
	const settingsQuery = useSettingsQuery()

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
								{settingsQuery.data?.ledger?.name}
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
						onSelect={(ledger) => {
							setOpen(false)
							toast({
								description: (
									<>
										Switched to the ledger: <b>{ledger.name}</b>
									</>
								),
								duration: SHORT_TOAST_DURATION
							})
						}}
					/>
				</DialogContent>
			</div>
		</Dialog>
	)
}
