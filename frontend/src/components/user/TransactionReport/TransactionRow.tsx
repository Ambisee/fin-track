import { StyleSheet, Text, View } from "@react-pdf/renderer"
import type { Entry } from "./types"
import { colors, columns, fonts } from "./theme"
import { columnOf, formatDate, formatMoney, formatRowNumber } from "./format"

interface Props {
	entry: Entry
	/** 0-based index in the entries array; determines the row number. */
	index: number
	/** The last row uses a thicker bottom border. */
	isLast?: boolean
}

export const TransactionRow = ({ entry, index, isLast = false }: Props) => {
	const column = columnOf(entry)
	const money = formatMoney(entry.amount)
	return (
		<View
			style={[styles.row, isLast ? styles.rowLast : styles.rowMiddle]}
			wrap={false}
		>
			<Text style={{ width: columns.no }}>{formatRowNumber(index)}</Text>
			<Text style={{ width: columns.date }}>{formatDate(entry.date)}</Text>
			<Text style={{ width: columns.category }}>{entry.category}</Text>
			<Text
				style={{
					width: columns.credit,
					textAlign: "right",
					color: colors.credit
				}}
			>
				{column === "credit" ? money : ""}
			</Text>
			<Text
				style={{
					width: columns.debit,
					textAlign: "right",
					color: colors.debit
				}}
			>
				{column === "debit" ? money : ""}
			</Text>
		</View>
	)
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		paddingVertical: 6,
		fontFamily: fonts.regular,
		fontSize: 10,
		lineHeight: 1.2,
		color: colors.ink
	},
	rowMiddle: { borderBottomWidth: 0.25, borderBottomColor: colors.ruleLight },
	rowLast: { borderBottomWidth: 0.5, borderBottomColor: colors.ink }
})
