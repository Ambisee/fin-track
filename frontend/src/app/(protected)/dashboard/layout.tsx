"use client"

import MiniSearch from "minisearch"
import { Dialog } from "@/components/ui/dialog"

import EntryForm from "@/components/user/EntryForm/EntryForm"
import ProtectedNavbar from "@/components/user/ProtectedNavbar"
import useGlobalStore from "@/lib/store"
import { useEntryDataQuery, useUserQuery } from "@/lib/hooks"
import { createContext, useEffect, useRef } from "react"

interface DashboardLayoutProps {
	children: JSX.Element
}

interface DashboardContextObject {
	search: MiniSearch
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

	return <EntryForm data={data} onSubmitSuccess={onSubmitSuccess} />
}

function DashboardContextProvider(props: { children: JSX.Element }) {
	const searchRef = useRef(
		new MiniSearch({
			fields: ["index", "amount", "date", "category.name", "note"],
			storeFields: ["index"],
			idField: "index",
			extractField: (document, fieldName) => {
				return fieldName
					.split(".")
					.reduce((doc, key) => doc && doc[key], document)
			}
		})
	)
	const entryQuery = useEntryDataQuery()

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
		<DashboardContext.Provider value={{ search: searchRef.current }}>
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
