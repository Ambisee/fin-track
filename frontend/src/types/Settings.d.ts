import { Ledger } from "./Ledger"

export interface Settings {
	userId: string
	visibleLedger: Ledger
	allowMonthlyReport: boolean
}
