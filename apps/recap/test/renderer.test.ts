import { describe, expect, it } from "vitest"
import { ReactPdfRenderer } from "../src/adapters/react-pdf/renderer"
import type { ReportEntry } from "../src/domain/types"

const entries = (n: number): ReportEntry[] =>
	Array.from({ length: n }, (_, i) => ({
		category: ["Groceries", "Rent", "Salary", "Dining"][i % 4],
		date: `2026-10-${String(1 + (i % 28)).padStart(2, "0")}`,
		amount: 10 + i,
		isPositive: i % 4 === 2
	}))

const render = (n: number) =>
	new ReactPdfRenderer().render({
		username: "ada",
		ledgerName: "Household",
		currency: "USD",
		locale: "en-US",
		period: { key: "2026-10", from: "2026-10-01", to: "2026-10-31" },
		entries: entries(n),
		generatedAtIso: "2026-11-01T01:00:00.000Z"
	})

describe("ReactPdfRenderer (real components)", () => {
	it("produces a PDF", async () => {
		const pdf = await render(5)
		expect(Buffer.from(pdf.slice(0, 5)).toString()).toBe("%PDF-")
		expect(pdf.byteLength).toBeGreaterThan(2_000)
	})
	it("paginates long ledgers into a bigger document", async () => {
		const [small, large] = await Promise.all([render(5), render(150)])
		expect(large.byteLength).toBeGreaterThan(small.byteLength)
	})
})
