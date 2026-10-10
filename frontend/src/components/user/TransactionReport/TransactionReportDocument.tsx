"use client"

import { Document, Page, StyleSheet } from "@react-pdf/renderer"
import type { ReportDocumentProps } from "./types"
import { fonts, pageSpacing } from "./theme"
import { ReportTitle } from "./ReportTitle"
import { DocumentInfoSection } from "./DocumentInfoSection"
import { TransactionTable } from "./TransactionTable"
import { PageFooter } from "./PageFooter"

export default function TransactionReportDocument({
	info,
	entries,
	title,
	generatedAt
}: ReportDocumentProps) {
	return (
		<Document
			title={`${info.ledger} - Financial Report`}
			author={info.username}
		>
			<Page size="A4" style={styles.page} wrap>
				<ReportTitle title={title} />
				<DocumentInfoSection {...info} />
				<TransactionTable entries={entries} />
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
