"use client"

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import MiniSearch from "minisearch"

import { useToast } from "@/components/ui/use-toast"
import EntryForm from "@/components/user/EntryForm/EntryForm"
import LedgerGroup from "@/components/user/LedgerGroup"
import ProtectedNavbar from "@/components/user/ProtectedNavbar"
import {
	ENTRY_QKEY,
	LEDGER_QKEY,
	MONTHS,
	SHORT_TOAST_DURATION,
	USER_SETTINGS_QKEY
} from "@/lib/constants"
import { useEntryDataQuery, useSettingsQuery } from "@/lib/hooks"
import useGlobalStore from "@/lib/store"
import { groupDataByMonth, MonthGroup } from "@/lib/utils"
import { useQueryClient } from "@tanstack/react-query"
import {
	createContext,
	Suspense,
	useEffect,
	useMemo,
	useRef,
	useState,
	type JSX
} from "react"
import Loading from "./loading"
import { useRouter } from "next/navigation"

interface DashboardLayoutProps {
	children: JSX.Element
}

interface DashboardContextObject {
	search: MiniSearch
	dataGroups: MonthGroup[]
}

const DashboardContext = createContext<DashboardContextObject>(null!)

function LayoutEntryDialog(props: { children?: JSX.Element | JSX.Element[] }) {
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

	return (
		<EntryForm
			key={JSON.stringify(data)}
			data={data}
			onSubmitSuccess={onSubmitSuccess}
		/>
	)
}

function LayoutLedgerEditorDialog() {
	const [open, setOpen] = useState(false)

	const { toast } = useToast()
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
					onCreate={(data) => {
						queryClient.invalidateQueries({ queryKey: LEDGER_QKEY })
					}}
					onUpdate={(data) => {
						queryClient.invalidateQueries({ queryKey: LEDGER_QKEY })
					}}
					onDelete={(data) => {
						queryClient.invalidateQueries({ queryKey: LEDGER_QKEY })
					}}
					onSelect={async (data) => {
						setOpen(false)
						await queryClient.invalidateQueries({
							queryKey: USER_SETTINGS_QKEY
						})
						await queryClient.invalidateQueries({
							queryKey: ENTRY_QKEY
						})

						toast({
							description: (
								<>
									Switched to the ledger: <b>{data.name}</b>
								</>
							),
							duration: SHORT_TOAST_DURATION
						})
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
					{settingsQuery.data?.data?.ledger?.name}
				</span>
			</button>
		</DialogTrigger>
	)
}

function DashboardContextProvider(props: { children: JSX.Element }) {
	const entryQuery = useEntryDataQuery()

	const dataGroups = useMemo(() => {
		if (entryQuery.isLoading) {
			return []
		}

		if (entryQuery.data === undefined || entryQuery.data.data === null) {
			return []
		}

		const result = groupDataByMonth(entryQuery.data.data)
		if (result.length < 1) {
			const d = new Date()
			return [
				{
					month: MONTHS[d.getMonth()],
					year: d.getFullYear(),
					data: []
				}
			]
		}

		return result
	}, [entryQuery.data, entryQuery.isLoading])

	const searchRef = useRef(
		new MiniSearch({
			fields: ["index", "amount", "category", "note"],
			storeFields: ["index"],
			idField: "index"
		})
	)

	useEffect(() => {
		if (!entryQuery.data?.data) {
			return
		}

		searchRef.current.removeAll()
		searchRef.current.addAll(
			entryQuery.data.data.map((val, index) => ({ ...val, index: index }))
		)
	}, [entryQuery])

	return (
		<DashboardContext.Provider
			value={{ dataGroups: dataGroups, search: searchRef.current }}
		>
			{props.children}
		</DashboardContext.Provider>
	)
}

export default function DashboardLayout(props: DashboardLayoutProps) {
	return (
		<DashboardContextProvider>
			<LayoutEntryDialog>
				<div className="dashboard-content" vaul-drawer-wrapper="">
					<Suspense fallback={<Loading />}>{props.children}</Suspense>
					<LayoutLedgerEditorDialog />
				</div>
				<ProtectedNavbar />
				<LayoutEntryDialogContent />
			</LayoutEntryDialog>
		</DashboardContextProvider>
	)
}

export { DashboardContext }
