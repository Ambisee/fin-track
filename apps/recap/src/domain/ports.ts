import type {
	DeliveryStatus,
	LedgerEntries,
	LedgerOutcome,
	Period,
	RecapUser,
	ReportEntry
} from "./types"

/** Where the entries live. Implementations read in batches internally and return everything grouped by ledger. */
export interface Source {
	/** The existing API that returns every opted-in user together with their opted-in ledgers. One call, no paging. */
	fetchOptedInUserDataList(): Promise<RecapUser[]>

	/**
	 * All entries dated inside `period` and created at or before `cutoffIso`, for the given ledgers.
	 * Ledgers without entries are simply absent from the result.
	 */
	fetchLedgerEntries(
		ledgerIds: string[],
		period: Period,
		cutoffIso: string
	): Promise<LedgerEntries[]>
}

export type ClaimResult =
	/** This caller owns the delivery and may proceed. */
	| "claimed"
	/** Already sent or intentionally skipped: nothing to do. */
	| "done"
	/** Another run holds an unexpired claim. */
	| "in_progress"

/** Durable record that makes the job idempotent across runs (cron can fire twice, runs can be restarted). */
export interface RecapLog {
	/**
	 * Creates the period on first call and returns its canonical snapshot cutoff.
	 * Every later call (duplicate cron, rerun) gets the SAME cutoff, which is what guarantees one data snapshot.
	 */
	ensurePeriod(periodKey: string): Promise<{ cutoffIso: string }>
	claimDelivery(
		periodKey: string,
		userId: string,
		leaseSeconds: number
	): Promise<ClaimResult>
	completeDelivery(
		periodKey: string,
		userId: string,
		result: {
			status: DeliveryStatus
			outcomes: LedgerOutcome[]
			error?: string
		}
	): Promise<void>
}

export interface ReportStorage {
	put(key: string, data: Uint8Array): Promise<void>
	get(key: string): Promise<Uint8Array>
}

export interface ReportInput {
	username: string
	ledgerName: string
	currency: string
	locale: string
	period: Period
	entries: ReportEntry[]
	/** Shown in the footer. Pass the snapshot cutoff so re-renders are reproducible. */
	generatedAtIso: string
}

export interface ReportRenderer {
	render(input: ReportInput): Promise<Uint8Array>
}

export interface MailAttachment {
	filename: string
	content: Uint8Array
	contentType: string
}

export interface MailMessage {
	to: string
	subject: string
	text: string
	html: string
	attachments: MailAttachment[]
}

export interface Mailer {
	/** Throws PermanentMailError when retrying cannot help (bad credentials, rejected recipient). */
	send(message: MailMessage): Promise<void>
}

export class PermanentMailError extends Error {
	override name = "PermanentMailError"
}
