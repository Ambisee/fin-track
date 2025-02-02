import { useState } from "react"
import LedgerPage, { LedgerPageProps } from "./LedgerPage"
import LedgersListPage, { LedgersListPageProps } from "./LedgersListPage"
import { Ledger } from "@/types/supabase"

type LedgerGroupProps = LedgersListPageProps & LedgerPageProps

export default function LedgerGroup(props: LedgerGroupProps) {
	const [currentPage, setCurrentPage] = useState(0)
	const [currentLedger, setCurrentLedger] = useState<Ledger | undefined>()

	const Component = [
		<LedgersListPage
			key="ledger-list-page"
			onAddButton={() => {
				setCurrentLedger(undefined)
				setCurrentPage(1)
			}}
			onBackButton={props.onBackButton}
			onDelete={props.onDelete}
			onSelect={(ledger, isEditing) => {
				if (isEditing) {
					setCurrentLedger(ledger)
					setCurrentPage(1)
					return
				}

				props.onSelect?.(ledger, isEditing)
			}}
		/>,
		<LedgerPage
			key="ledger-page"
			data={currentLedger}
			onBackButton={() => {
				setCurrentLedger(undefined)
				setCurrentPage(0)
			}}
			onCreate={props.onCreate}
			onEdit={props.onEdit}
		/>
	]

	return Component[currentPage]
}
