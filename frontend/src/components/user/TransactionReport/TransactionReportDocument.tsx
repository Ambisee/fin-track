import { DateRange } from "@/lib/helper/DateHelper"
import { Entry } from "@/types/supabase"
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer"

const styles = StyleSheet.create({
	page: {
		padding: 48,
		fontSize: 11,
		lineHeight: 1.6,
		color: "#3f3f46"
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		borderBottomWidth: 1,
		borderBottomColor: "#e4e4e7",
		paddingBottom: 12
	}
})

interface TransactionReportDocumentProps {
	dateRange: DateRange
	createdAt: Date
	data: Entry[]
}

export default function TransactionReportDocument() {
	return (
		<Document>
			<Page style={styles.page} size="A4">
				<Text>This is rendered</Text>
			</Page>
		</Document>
	)
}
