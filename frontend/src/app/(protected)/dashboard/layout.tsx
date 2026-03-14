"use client"

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

import EntryForm from "@/components/user/EntryForm/EntryForm"
import LedgerGroup from "@/components/user/LedgerGroup"
import ProtectedNavbar from "@/components/user/ProtectedNavbar"
import {
	LEDGER_QKEY,
	SHORT_TOAST_DURATION,
	USER_SETTINGS_QKEY
} from "@/lib/constants"
import { useSettingsQuery } from "@/lib/hooks"
import useGlobalStore from "@/lib/store"
import { useQueryClient } from "@tanstack/react-query"
import { ReactNode, Suspense, useState } from "react"
import { toast } from "sonner"
import Loading from "./loading"

interface DashboardLayoutProps {
	children: ReactNode
}

function LayoutEntryDialog(props: { children?: ReactNode | ReactNode[] }) {
	const open = useGlobalStore((state) => state.open)
	const setOpen = useGlobalStore((state) => state.setOpen)

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{props.children}
		</Dialog>
	)
}

function LayoutEntryDialogContent() {
	const data = useGlobalStore((state) => state.data)
	const onSubmitSuccess = useGlobalStore((state) => state.onSubmitSuccess)

	return <EntryForm data={data} onSubmitSuccess={onSubmitSuccess} />
}

function LayoutLedgerEditorDialog() {
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
					onSelect={async (data) => {
						setOpen(false)
						await queryClient.invalidateQueries({
							queryKey: USER_SETTINGS_QKEY
						})

						toast.info(
							<>
								Switched to the ledger: <b>{data.name}</b>
							</>,
							{ duration: SHORT_TOAST_DURATION }
						)
					}}
				/>
			</DialogContent>
		</Dialog>
	)
}

function LedgerBadge() {
	const settingsQuery = useSettingsQuery()

	if (settingsQuery.isLoading || !settingsQuery.isFetchedAfterMount) {
		return undefined
	}

	return (
		<DialogTrigger asChild>
			<button className="absolute top-[38px] right-4">
				<span className="w-full text-sm bg-secondary text-secondary-foreground rounded-full py-1 px-6">
					{settingsQuery.data?.ledger?.name}
				</span>
			</button>
		</DialogTrigger>
	)
}

export default function DashboardLayout(props: DashboardLayoutProps) {
	return (
		<LayoutEntryDialog>
			<div className="dashboard-content">
				<Suspense fallback={<Loading />}>{props.children}</Suspense>
				<LayoutLedgerEditorDialog />
			</div>
			<ProtectedNavbar />
			<LayoutEntryDialogContent />
		</LayoutEntryDialog>
	)
}
