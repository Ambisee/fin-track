import { StyleSheet, Text, View } from "@react-pdf/renderer"
import { colors, columns, fonts } from "./theme"

export const TransactionTableHeader = () => (
	<View style={styles.row}>
		<Text style={{ width: columns.no }}>NO.</Text>
		<Text style={{ width: columns.date }}>DATE</Text>
		<Text style={{ width: columns.category }}>CATEGORY</Text>
		<Text style={{ width: columns.credit, textAlign: "right" }}>CREDIT</Text>
		<Text style={{ width: columns.debit, textAlign: "right" }}>DEBIT</Text>
	</View>
)

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		paddingVertical: 6,
		fontFamily: fonts.bold,
		fontSize: 9,
		lineHeight: 1.2,
		color: colors.ink,
		borderTopWidth: 0.75,
		borderTopColor: colors.ink,
		borderBottomWidth: 0.5,
		borderBottomColor: colors.ink
	}
})
