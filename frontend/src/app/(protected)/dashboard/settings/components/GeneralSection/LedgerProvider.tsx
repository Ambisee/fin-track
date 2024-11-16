"use client"

import { Category, Ledger } from "@/types/supabase"
import {
	createContext,
	Dispatch,
	SetStateAction,
	useContext,
	useState
} from "react"

interface LedgerStoreObject {
	ledger?: Ledger
	setLedger: Dispatch<SetStateAction<Ledger | undefined>>
}

const LedgerToEditContext = createContext<LedgerStoreObject>(null!)

export function useLedgerStore() {
	return useContext(LedgerToEditContext)
}

export default function LedgerStoreProvider(props: {
	initialValues?: Partial<Pick<LedgerStoreObject, "ledger">>
	children: JSX.Element
}) {
	const [ledger, setLedger] = useState(props.initialValues?.ledger)

	return (
		<LedgerToEditContext.Provider
			value={{ ledger: ledger, setLedger: setLedger }}
		>
			{props.children}
		</LedgerToEditContext.Provider>
	)
}
