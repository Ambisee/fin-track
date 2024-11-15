import { Category, Ledger } from "@/types/supabase"
import {
	createContext,
	Dispatch,
	SetStateAction,
	useContext,
	useState
} from "react"

interface LedgerToEditObject {
	ledgerToEdit?: Ledger
	setLedgerToEdit: Dispatch<SetStateAction<Ledger | undefined>>
}

const LedgerToEditContext = createContext<LedgerToEditObject>(null!)

export function useLedgerToEdit() {
	return useContext(LedgerToEditContext)
}

export default function LedgerToEditProvider(props: {
	initialValues?: Partial<Pick<LedgerToEditObject, "ledgerToEdit">>
	children: JSX.Element
}) {
	const [ledgerToEdit, setLedgerToEdit] = useState(
		props.initialValues?.ledgerToEdit
	)

	return (
		<LedgerToEditContext.Provider value={{ ledgerToEdit, setLedgerToEdit }}>
			{props.children}
		</LedgerToEditContext.Provider>
	)
}
