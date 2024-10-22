"use client"

import MiniSearch from "minisearch"
import { Dialog } from "@/components/ui/dialog"

import EntryForm from "@/components/user/EntryForm/EntryForm"
import ProtectedNavbar from "@/components/user/ProtectedNavbar"
import useGlobalStore from "@/lib/store"
import { useEntryDataQuery } from "@/lib/hooks"
import { createContext, useEffect, useMemo, useRef } from "react"
import { groupDataByMonth, MonthGroup } from "@/lib/utils"
import { MONTHS } from "@/lib/constants"

interface DashboardLayoutProps {
	children: JSX.Element
}

interface DashboardContextObject {
	search: MiniSearch
	dataGroups: MonthGroup[]
}

const DashboardContext = createContext<DashboardContextObject>(null!)

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

	return (
		<EntryForm
			key={JSON.stringify(data)}
			data={data}
			onSubmitSuccess={onSubmitSuccess}
		/>
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
			<LayoutDialog>
				<>
					<div className="dashboard-content" vaul-drawer-wrapper="">
						{props.children}
					</div>
					<ProtectedNavbar />
					<LayoutEntryForm />
				</>
			</LayoutDialog>
		</DashboardContextProvider>
	)
}

export { DashboardContext }
