"use client"

import { Dialog } from "@/components/ui/dialog"
import EntryForm from "@/components/user/EntryForm/EntryForm"
import ProtectedNavbar from "@/components/user/ProtectedNavbar"
import useGlobalStore from "@/lib/store"

interface DashboardLayoutProps {
	children: JSX.Element
}

function LayoutDialog(props: { children: JSX.Element }) {
	const open = useGlobalStore((state) => state.open)
	const setOpen = useGlobalStore((state) => state.setOpen)

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{props.children}
		</Dialog>
	)
}

function LayoutEntryForm() {
	const data = useGlobalStore((state) => state.data)
	const onSubmitSuccess = useGlobalStore((state) => state.onSubmitSuccess)

	return <EntryForm data={data} onSubmitSuccess={onSubmitSuccess} />
}

export default function DashboardLayout(props: DashboardLayoutProps) {
	return (
		<LayoutDialog>
			<>
				<div className="dashboard-content" vaul-drawer-wrapper="">
					{props.children}
				</div>
				<ProtectedNavbar />
				<LayoutEntryForm />
			</>
		</LayoutDialog>
	)
}
