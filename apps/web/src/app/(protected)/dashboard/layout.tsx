"use client"

import { Suspense } from "react"
import LayoutEntryDialog from "./_components/LayoutEntryDialog"
import LayoutLedgerEditorDialog from "./_components/LayoutLedgerEditorDialog"
import Loading from "./loading"
import ProtectedNavbar from "@/components/user/ProtectedNavbar"
import LayoutEntryDialogContent from "./_components/LayoutEntryDialogContent"

export default function DashboardLayout(props: LayoutProps<"/dashboard">) {
	return (
		<LayoutEntryDialog>
			<div className="dashboard-content">
				<LayoutLedgerEditorDialog />
				<Suspense fallback={<Loading />}>{props.children}</Suspense>
			</div>
			<ProtectedNavbar />
			<LayoutEntryDialogContent />
		</LayoutEntryDialog>
	)
}
