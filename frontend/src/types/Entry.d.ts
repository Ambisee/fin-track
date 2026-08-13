import { Ledger } from "./Ledger"

export interface Entry {
	id: number
	date: Date
	type: "Expense" | "Income"
	category: string
	ledger: Ledger
	amount: number
	note: string | null
}
