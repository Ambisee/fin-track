import { describe, expect, it } from "vitest"
import {
	composeEmail,
	markOmitted,
	planAttachments,
	uniqueFileNames
} from "../src/domain/email"
import { reportFileName, reportKey } from "../src/domain/naming"
import {
	currentMonthKey,
	isFinished,
	parsePeriodKey,
	previousMonthKey
} from "../src/domain/period"
import { PermanentMailError } from "../src/domain/ports"
import type { IncludedOutcome, LedgerOutcome } from "../src/domain/types"
import { classifyMailError } from "../src/adapters/nodemailer/mailer"

const inc = (id: string, name: string, size: number): IncludedOutcome => ({
	ledgerId: id,
	ledgerName: name,
	status: "included",
	entryCount: 3,
	storageKey: `k/${id}`,
	fileName: `${name}.pdf`,
	sizeBytes: size
})

describe("period", () => {
	it("parses month boundaries, including leap years", () => {
		expect(parsePeriodKey("2026-10")).toEqual({ key: "2026-10", from: "2026-10-01", to: "2026-10-31" })
		expect(parsePeriodKey("2024-02").to).toBe("2024-02-29")
		expect(parsePeriodKey("2026-02").to).toBe("2026-02-28")
		expect(parsePeriodKey("2026-04").to).toBe("2026-04-30")
	})
	it("rejects malformed keys", () => {
		for (const bad of ["2026-13", "2026-00", "26-10", "2026-1", "2026-10-01", ""])
			expect(() => parsePeriodKey(bad)).toThrow()
	})
	it("previous month wraps the year", () => {
		expect(previousMonthKey(new Date("2026-01-01T01:00:00Z"), "UTC")).toBe("2025-12")
		expect(previousMonthKey(new Date("2026-11-01T01:00:00Z"), "UTC")).toBe("2026-10")
	})
	it("decides the month in the configured zone, not UTC", () => {
		// 2026-11-01 01:00 UTC is still Oct 31 evening in Los Angeles, and already Nov 1 08:00 in Jakarta.
		const now = new Date("2026-11-01T01:00:00Z")
		expect(currentMonthKey(now, "America/Los_Angeles")).toBe("2026-10")
		expect(currentMonthKey(now, "Asia/Jakarta")).toBe("2026-11")
		expect(previousMonthKey(now, "Asia/Jakarta")).toBe("2026-10")
		expect(previousMonthKey(now, "America/Los_Angeles")).toBe("2026-09")
	})
	it("refuses periods that are not over yet", () => {
		const now = new Date("2026-11-01T01:00:00Z")
		expect(isFinished("2026-10", now, "UTC")).toBe(true)
		expect(isFinished("2026-11", now, "UTC")).toBe(false)
		expect(isFinished("2026-10", now, "America/Los_Angeles")).toBe(false)
	})
})

describe("attachments", () => {
	it("keeps what fits, in order, and reports the rest as omitted", () => {
		const plan = planAttachments([inc("a", "A", 6), inc("b", "B", 6), inc("c", "C", 3)], 10)
		expect(plan.include.map((o) => o.ledgerId)).toEqual(["a", "c"])
		expect(plan.omitted.map((o) => o.ledgerId)).toEqual(["b"])
	})
	it("marks omitted ledgers without touching the others", () => {
		const outcomes: LedgerOutcome[] = [inc("a", "A", 1), inc("b", "B", 1), { ledgerId: "c", ledgerName: "C", status: "empty" }]
		const out = markOmitted(outcomes, ["b"])
		expect(out.map((o) => o.status)).toEqual(["included", "omitted", "empty"])
	})
	it("de-duplicates file names", () => {
		expect(uniqueFileNames(["x.pdf", "x.pdf", "y.pdf", "x.pdf"])).toEqual(["x.pdf", "x-2.pdf", "y.pdf", "x-3.pdf"])
	})
})

describe("email", () => {
	const recipient = { id: "u", email: "a@b.c", username: "ada <script>", locale: "en-US" }
	it("names missing ledgers and escapes HTML", () => {
		const m = composeEmail({
			recipient,
			period: parsePeriodKey("2026-10"),
			attached: [inc("a", "Household", 1)],
			missing: [{ ledgerId: "b", ledgerName: "Trip & <b>Co</b>", status: "failed", error: "x" }]
		})
		expect(m.subject).toBe("Your FinTrack recap for October 2026")
		expect(m.text).toContain("Household (3 entries)")
		expect(m.text).toContain("Trip & <b>Co</b>")
		expect(m.html).toContain("Trip &amp; &lt;b&gt;Co&lt;/b&gt;")
		expect(m.html).toContain("ada &lt;script&gt;")
		expect(m.html).not.toContain("<script>")
	})
	it("has no 'heads up' when nothing is missing", () => {
		const m = composeEmail({ recipient, period: parsePeriodKey("2026-10"), attached: [inc("a", "A", 1)], missing: [] })
		expect(m.text).not.toContain("Heads up")
	})
	it("falls back to en-US for a bad locale", () => {
		const m = composeEmail({ recipient: { ...recipient, locale: "not_a_locale" }, period: parsePeriodKey("2026-10"), attached: [], missing: [] })
		expect(m.subject).toContain("October 2026")
	})
})

describe("naming", () => {
	it("is deterministic and filesystem-safe", () => {
		expect(reportKey("2026-10", "u1", "l1")).toBe("2026-10/u1/l1.pdf")
		expect(reportFileName("Rumah Tangga / Ünïcode!", "2026-10")).toBe("fintrack-2026-10-rumah-tangga-unicode.pdf")
		expect(reportFileName("!!!", "2026-10")).toBe("fintrack-2026-10-ledger.pdf")
	})
})

describe("smtp error classification", () => {
	it("treats auth failures and 5xx as permanent, 4xx and network errors as transient", () => {
		expect(classifyMailError({ code: "EAUTH", message: "bad creds" })).toBeInstanceOf(PermanentMailError)
		expect(classifyMailError({ responseCode: 550, message: "no such user" })).toBeInstanceOf(PermanentMailError)
		expect(classifyMailError({ responseCode: 421, message: "try later" })).not.toBeInstanceOf(PermanentMailError)
		expect(classifyMailError(Object.assign(new Error("reset"), { code: "ECONNRESET" }))).not.toBeInstanceOf(PermanentMailError)
	})
})
