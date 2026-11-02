import { groupEntriesByLedger, type EntryRow } from "../../domain/ledgers"
import type {
	ClaimResult,
	Source,
	MailMessage,
	Mailer,
	RecapLog,
	ReportRenderer,
	ReportStorage
} from "../../domain/ports"
import type { RecapUser } from "../../domain/types"

/**
 * In-memory adapters for local development (RECAP_ADAPTERS=memory) and tests. They mirror the semantics of the
 * real ones, including the claim lease. The seed data exercises every path: normal, an empty ledger, a ledger
 * whose report always fails to render, an inactive user and a user with no opted-in ledgers.
 */

const BROKEN_LEDGER_NAME = "Broken Ledger"

const users: RecapUser[] = [
	{
		id: "u1",
		email: "ada@example.com",
		username: "ada",
		ledgers: [
			{ id: "l1", name: "Household", currency: "USD" },
			{ id: "l2", name: "Travel", currency: "EUR" }
		]
	},
	{
		id: "u2",
		email: "grace@example.com",
		username: "grace",
		ledgers: [
			{ id: "l3", name: "Freelance", currency: "USD" },
			{ id: "l4", name: "Empty One", currency: "USD" },
			{ id: "l5", name: BROKEN_LEDGER_NAME, currency: "USD" }
		]
	},
	{
		id: "u3",
		email: "linus@example.com",
		username: "linus",
		ledgers: [{ id: "l6", name: "Quiet", currency: "USD" }]
	},
	{ id: "u4", email: "nobody@example.com", username: "nobody", ledgers: [] }
]

const EMPTY_LEDGERS = new Set(["l4", "l6"])
const CATS_OUT = ["Groceries", "Rent", "Utilities", "Transport", "Dining"]
const CATS_IN = ["Salary", "Freelance", "Refund"]

function fakeRows(ledgerId: string, from: string): EntryRow[] {
	if (EMPTY_LEDGERS.has(ledgerId)) return []
	const [y, m] = from.split("-")
	return Array.from({ length: ledgerId === "l1" ? 70 : 12 }, (_, i) => {
		const credit = i % 5 === 0
		const cats = credit ? CATS_IN : CATS_OUT
		return {
			id: `${ledgerId}-${String(i).padStart(4, "0")}`,
			ledgerId,
			category: cats[i % cats.length],
			date: `${y}-${m}-${String(1 + (i % 28)).padStart(2, "0")}`,
			amount: 20 + ((i * 37) % 400) + 0.25,
			isPositive: credit
		}
	})
}

/** Wraps a renderer so the ledger named "Broken Ledger" always fails, to demonstrate the partial recap. */
export function simulateRenderFailures(inner: ReportRenderer): ReportRenderer {
	return {
		async render(input) {
			if (input.ledgerName === BROKEN_LEDGER_NAME)
				throw new Error("simulated render failure")
			return inner.render(input)
		}
	}
}

export function createMemoryAdapters() {
	const source: Source = {
		async fetchLedgerEntries(ledgerIds, period) {
			return groupEntriesByLedger(
				ledgerIds.flatMap((id) => fakeRows(id, period.from))
			)
		},
		async fetchOptedInUserDataList() {
			return users
		}
	}

	const periods = new Map<string, string>()
	const deliveries = new Map<
		string,
		{ status: string; leaseUntil: number | null; attempts: number }
	>()
	const log: RecapLog = {
		async ensurePeriod(key) {
			if (!periods.has(key)) periods.set(key, new Date().toISOString())
			return { cutoffIso: periods.get(key)! }
		},
		async claimDelivery(periodKey, userId, leaseSeconds): Promise<ClaimResult> {
			const k = `${periodKey}:${userId}`
			const row = deliveries.get(k)
			const reclaimable =
				!row ||
				row.status === "failed" ||
				(row.status === "sending" && (row.leaseUntil ?? 0) < Date.now())
			if (reclaimable) {
				deliveries.set(k, {
					status: "sending",
					leaseUntil: Date.now() + leaseSeconds * 1000,
					attempts: (row?.attempts ?? 0) + 1
				})
				return "claimed"
			}
			return row!.status === "sending" ? "in_progress" : "done"
		},
		async completeDelivery(periodKey, userId, result) {
			deliveries.set(`${periodKey}:${userId}`, {
				status: result.status,
				leaseUntil: null,
				attempts: deliveries.get(`${periodKey}:${userId}`)?.attempts ?? 1
			})
			console.log(
				`[recap] ${periodKey} ${userId} -> ${result.status}`,
				result.outcomes.map((o) => `${o.ledgerName}:${o.status}`).join(", ")
			)
		}
	}

	const files = new Map<string, Uint8Array>()
	const storage: ReportStorage = {
		async put(key, data) {
			files.set(key, data)
		},
		async get(key) {
			const f = files.get(key)
			if (!f) throw new Error(`memory storage: ${key} not found`)
			return f
		}
	}

	const mailer: Mailer = {
		async send(m: MailMessage) {
			console.log(
				`[mail:memory] to=${m.to} subject="${m.subject}" attachments=${m.attachments
					.map((a) => `${a.filename}(${a.content.byteLength}B)`)
					.join(", ")}\n${m.text}`
			)
		}
	}

	return { source, log, storage, mailer }
}
