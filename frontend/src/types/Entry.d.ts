import { Category } from "./Category"
import { Ledger } from "./Ledger"

export interface Entry {
	id: number
	date: Date
	type: "Expense" | "Income"
	category: Category
	ledger: Ledger
	amount: number
	note: string | null
}
