/** Plain, serializable data only: everything here crosses workflow/step boundaries. */

export interface Period {
	/** "YYYY-MM" */
	key: string
	/** First day, "YYYY-MM-DD" (inclusive). */
	from: string
	/** Last day, "YYYY-MM-DD" (inclusive). */
	to: string
}

export interface LedgerInfo {
	id: string
	name: string
	/** ISO 4217 code, e.g. "USD". */
	currency: string
}

/** A user as returned by the existing "opted-in users + ledgers" API. This is also the WFUser workflow input. */
export interface RecapUser {
	id: string
	email: string
	username: string
	/** BCP 47 tag for number/date formatting. The API does not send one today, so DEFAULT_LOCALE applies. */
	locale?: string
	/** Only ledgers the user opted in to the recap. */
	ledgers: LedgerInfo[]
}

export interface ReportEntry {
	category: string
	/** "YYYY-MM-DD" */
	date: string
	/** Absolute amount. */
	amount: number
	/** true -> CREDIT column, false -> DEBIT column. */
	isPositive: boolean
}

/** All entries of one ledger inside the recap period. */
export interface LedgerEntries {
	ledgerId: string
	entries: ReportEntry[]
}

interface OutcomeBase {
	ledgerId: string
	ledgerName: string
}

/** What happened to one ledger. The email and the delivery log are both derived from this list. */
export type LedgerOutcome =
	| (OutcomeBase & {
			status: "included"
			entryCount: number
			storageKey: string
			fileName: string
			sizeBytes: number
	  })
	| (OutcomeBase & { status: "empty" })
	| (OutcomeBase & { status: "failed"; error: string })
	/** Generated, but left out of the email (attachment size budget). */
	| (OutcomeBase & { status: "omitted" })

export type IncludedOutcome = Extract<LedgerOutcome, { status: "included" }>

export type DeliveryStatus = "sent" | "skipped_empty" | "failed"
