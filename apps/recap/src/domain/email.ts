import type { MailMessage } from "./ports"
import type {
	IncludedOutcome,
	LedgerOutcome,
	Period,
	RecapUser
} from "./types"
import { localeOf } from "./users"

export type MailRecipient = Pick<RecapUser, "email" | "username" | "locale">

export interface AttachmentPlan {
	include: IncludedOutcome[]
	omitted: IncludedOutcome[]
}

/**
 * Greedily keeps ledgers (in their given order) while the total stays within `maxBytes`.
 * Anything that does not fit is reported as omitted instead of blocking the whole email.
 */
export function planAttachments(
	included: IncludedOutcome[],
	maxBytes: number
): AttachmentPlan {
	const plan: AttachmentPlan = { include: [], omitted: [] }
	let used = 0
	for (const o of included) {
		if (used + o.sizeBytes <= maxBytes) {
			plan.include.push(o)
			used += o.sizeBytes
		} else {
			plan.omitted.push(o)
		}
	}
	return plan
}

/** Marks the ledgers that were generated but not attached. */
export function markOmitted(
	outcomes: LedgerOutcome[],
	omittedLedgerIds: string[]
): LedgerOutcome[] {
	const omitted = new Set(omittedLedgerIds)
	return outcomes.map((o) =>
		o.status === "included" && omitted.has(o.ledgerId)
			? { ledgerId: o.ledgerId, ledgerName: o.ledgerName, status: "omitted" }
			: o
	)
}

const escapeHtml = (s: string) =>
	s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")

export function monthLabel(period: Period, locale: string): string {
	const date = new Date(`${period.from}T00:00:00Z`)
	const options: Intl.DateTimeFormatOptions = {
		month: "long",
		year: "numeric",
		timeZone: "UTC"
	}
	try {
		return new Intl.DateTimeFormat(locale, options).format(date)
	} catch {
		return new Intl.DateTimeFormat("en-US", options).format(date)
	}
}

/** Makes attachment names unique within one email (two ledgers can share a name). */
export function uniqueFileNames(names: string[]): string[] {
	const seen = new Map<string, number>()
	return names.map((name) => {
		const n = (seen.get(name) ?? 0) + 1
		seen.set(name, n)
		if (n === 1) return name
		const dot = name.lastIndexOf(".")
		return dot > 0 ? `${name.slice(0, dot)}-${n}${name.slice(dot)}` : `${name}-${n}`
	})
}

export function composeEmail(args: {
	recipient: MailRecipient
	period: Period
	attached: IncludedOutcome[]
	/** Ledgers the reader should know are missing: failed or over the size budget. */
	missing: LedgerOutcome[]
}): Omit<MailMessage, "attachments"> {
	const { recipient, period, attached, missing } = args
	const label = monthLabel(period, localeOf(recipient))
	const subject = `Your FinTrack recap for ${label}`

	const lines = attached.map(
		(o) => `${o.ledgerName} (${o.entryCount} ${o.entryCount === 1 ? "entry" : "entries"})`
	)
	const missingNames = missing.map((o) => o.ledgerName)

	const text = [
		`Hi ${recipient.username},`,
		"",
		`Your ${label} recap is attached, one PDF per ledger:`,
		...lines.map((l) => `  - ${l}`),
		...(missingNames.length
			? [
					"",
					`Heads up: we couldn't include ${missingNames.join(", ")} this time.`,
					"Your data is safe and unaffected."
				]
			: []),
		"",
		"FinTrack"
	].join("\n")

	const html = [
		`<p>Hi ${escapeHtml(recipient.username)},</p>`,
		`<p>Your ${escapeHtml(label)} recap is attached, one PDF per ledger:</p>`,
		`<ul>${lines.map((l) => `<li>${escapeHtml(l)}</li>`).join("")}</ul>`,
		missingNames.length
			? `<p><strong>Heads up:</strong> we couldn't include ${escapeHtml(missingNames.join(", "))} this time. Your data is safe and unaffected.</p>`
			: "",
		`<p>FinTrack</p>`
	].join("")

	return { to: recipient.email, subject, text, html }
}
