"use client"

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import MiniSearch from "minisearch"

import DialogPagesProvider, {
	useDialogPages
} from "@/components/user/DialogPagesProvider"
import EntryForm from "@/components/user/EntryForm/EntryForm"
import ProtectedNavbar from "@/components/user/ProtectedNavbar"
import { MONTHS } from "@/lib/constants"
import { useEntryDataQuery, useSettingsQuery } from "@/lib/hooks"
import useGlobalStore from "@/lib/store"
import { groupDataByMonth, MonthGroup } from "@/lib/utils"
import {
	createContext,
	Suspense,
	useEffect,
	useMemo,
	useRef,
	use,
	type JSX
} from "react"
import LedgerPage from "./settings/components/GeneralSection/LedgerPage"
import LedgersToEditProvider from "./settings/components/GeneralSection/LedgerProvider"
import LedgersListPage from "./settings/components/GeneralSection/LedgersListPage"
import Loading from "./loading"

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

function LayoutLedgerEditorDialog(props: {
	children?: JSX.Element | JSX.Element[]
}) {
	return (
		<DialogPagesProvider>
			<LedgersToEditProvider>
				<Dialog>{props.children}</Dialog>
			</LedgersToEditProvider>
		</DialogPagesProvider>
	)
}

function LayoutLedgerEditorContent() {
	const { curPage, setCurPage } = useDialogPages()

	const renderPage = () => {
		const pages = [
			(props: any) => <LedgersListPage {...props} />,
			(props: any) => <LedgersListPage isEditMode={true} {...props} />,
			LedgerPage
		]
		const CurrentPage = pages[curPage]
		const props = { showBackButton: !(curPage === 0) }

		return <CurrentPage {...props} />
	}

	return (
		<DialogContent
			hideCloseButton
			onSubmit={(e) => e.stopPropagation()}
			onOpenAutoFocus={() => setCurPage(0)}
			className="auto-rows-fr h-dvh max-w-none duration-0 border-0 sm:border sm:h-5/6 sm:min-h-[460px] sm:max-w-lg"
		>
			{renderPage()}
		</DialogContent>
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
				<span className="text-sm mr-4 bg-secondary text-secondary-foreground rounded-full py-1 px-6">
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
					<LayoutLedgerEditorDialog>
						<>
							<LedgerBadge />
							<LayoutLedgerEditorContent />
						</>
					</LayoutLedgerEditorDialog>
				</div>
				<ProtectedNavbar />
				<LayoutEntryDialogContent />
			</LayoutEntryDialog>
		</DashboardContextProvider>
	)
}

export { DashboardContext }
