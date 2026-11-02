import { renderToBuffer } from "@react-pdf/renderer"
import { createElement } from "react"
// Your existing components (TransactionReportDocument and friends). In the monorepo this is a workspace package.
import { TransactionReportDocument } from "@fintrack/transaction-report"
import type { ReportInput, ReportRenderer } from "../../domain/ports"

/**
 * Thin adapter: maps the domain's ReportInput onto the existing react-pdf components.
 * Node runtime only (react-pdf does not run on Edge).
 *
 * This file deliberately contains NO JSX. Workflow's step bundler keeps JSX untouched (jsx: "preserve")
 * and the generated bundle is loaded as plain JavaScript, so any JSX reachable from a step would crash
 * at load time. createElement is equivalent and needs no transform.
 *
 * Titles are left to the component defaults on purpose ("FINTRACK REPORT" / "SUMMARY"); pass `title`
 * and `summaryTitle` here if you want the template wording ("FINANCIAL REPORT" / "CATEGORY SUMMARY").
 */
export class ReactPdfRenderer implements ReportRenderer {
	async render(input: ReportInput): Promise<Uint8Array> {
		const element = createElement(TransactionReportDocument, {
			info: {
				username: input.username,
				ledger: input.ledgerName,
				locale: input.locale,
				currency: input.currency,
				// Date-only values are anchored to UTC midnight; see README on time zones.
				period: {
					from: new Date(`${input.period.from}T00:00:00Z`),
					to: new Date(`${input.period.to}T00:00:00Z`)
				}
			},
			entries: input.entries,
			locale: input.locale,
			generatedAt: new Date(input.generatedAtIso)
		})
		// react-pdf's typings expect a <Document> element; our root is a component that renders one.
		const buffer = await renderToBuffer(
			element as unknown as Parameters<typeof renderToBuffer>[0]
		)
		return new Uint8Array(buffer)
	}
}
