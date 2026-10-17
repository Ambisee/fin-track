import { StyleSheet, View } from "@react-pdf/renderer"
import type { AmountFormatter, DocumentInfo, Entry } from "./types"
import { summaryLayout } from "./theme"
import { summarizeByCategory } from "./format"
import { ReportTitle } from "./ReportTitle"
import { DocumentInfoSection } from "./DocumentInfoSection"
import { CategorySection } from "./CategorySection"

interface Props {
	info: DocumentInfo
	entries: Entry[]
	title?: string
	formatAmount: AmountFormatter
}

/** Final page: credit and debit side by side, each as a donut chart plus a category breakdown. */
export const CategorySummary = ({
	info,
	entries,
	title = "SUMMARY",
	formatAmount
}: Props) => (
	<View>
		<ReportTitle title={title} />
		<DocumentInfoSection {...info} fields={["ledger", "period"]} />
		<View style={styles.columns}>
			<CategorySection
				kind="credit"
				stats={summarizeByCategory(entries, "credit")}
				formatAmount={formatAmount}
			/>
			<View style={styles.gap} />
			<CategorySection
				kind="debit"
				stats={summarizeByCategory(entries, "debit")}
				formatAmount={formatAmount}
			/>
		</View>
	</View>
)

const styles = StyleSheet.create({
	columns: { flexDirection: "row", alignItems: "flex-start" },
	gap: { width: summaryLayout.columnGap }
})
