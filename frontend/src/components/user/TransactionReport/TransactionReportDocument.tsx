"use client"

import { Document, Page, StyleSheet } from "@react-pdf/renderer"
import type { ReportDocumentProps } from "./types"
import { fonts, pageSpacing } from "./theme"
import { ReportTitle } from "./ReportTitle"
import { DocumentInfoSection } from "./DocumentInfoSection"
import { TransactionTable } from "./TransactionTable"
import { CategorySummary } from "./CategorySummary"
import { PageFooter } from "./PageFooter"
import { createAmountFormatter } from "./format"

export default function TransactionReportDocument({
	info,
	entries,
	title,
	summaryTitle,
	generatedAt,
	locale
}: ReportDocumentProps) {
	const formatAmount = createAmountFormatter(locale)
	return (
		<Document
			title={`${info.ledger} - Financial Report`}
			author={info.username}
		>
			<Page size="A4" style={styles.page} wrap>
				<ReportTitle title={title} />
				<DocumentInfoSection {...info} />
				<TransactionTable entries={entries} formatAmount={formatAmount} />
				<PageFooter generatedAt={generatedAt} />
			</Page>
			<Page size="A4" style={styles.page} wrap>
				<CategorySummary
					info={info}
					entries={entries}
					title={summaryTitle}
					formatAmount={formatAmount}
				/>
				<PageFooter generatedAt={generatedAt} />
			</Page>
		</Document>
	)
}

const styles = StyleSheet.create({
	page: {
		width: "100%",
		fontFamily: fonts.regular,
		paddingTop: pageSpacing.top,
		paddingBottom: pageSpacing.bottom,
		paddingHorizontal: pageSpacing.horizontal
	}
})
