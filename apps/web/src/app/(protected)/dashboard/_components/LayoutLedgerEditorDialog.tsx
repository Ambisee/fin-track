import { Dialog, DialogContent } from "@/components/ui/dialog"
import LedgerGroup from "@/components/user/LedgerGroup"
import { LEDGER_QKEY } from "@/lib/constants"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import LedgerBadge from "./LedgerBadge"

export default function LayoutLedgerEditorDialog() {
	const [open, setOpen] = useState(false)

	const queryClient = useQueryClient()

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<LedgerBadge />
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
					onSelect={async () => setOpen(false)}
				/>
			</DialogContent>
		</Dialog>
	)
}
