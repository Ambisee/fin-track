import { Dialog } from "@/components/ui/dialog"
import useGlobalStore from "@/lib/store"
import { ReactNode } from "react"

export default function LayoutEntryDialog(props: {
	children?: ReactNode | ReactNode[]
}) {
	const open = useGlobalStore((state) => state.open)
	const setOpen = useGlobalStore((state) => state.setOpen)

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{props.children}
		</Dialog>
	)
}
