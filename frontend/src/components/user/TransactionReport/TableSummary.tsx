import { StyleSheet, Text, View } from "@react-pdf/renderer"
import type { Entry } from "./types"
import { colors, columns, fonts } from "./theme"
import { formatMoney, formatSignedMoney, summarize } from "./format"

export const TableSummary = ({ entries }: { entries: Entry[] }) => {
	const { totalCredit, totalDebit, net } = summarize(entries)
	return (
		<View>
			<View style={[styles.row, styles.totalRow]}>
				<Text style={{ width: columns.no }} />
				<Text style={{ width: columns.category }} />
				<Text style={{ width: columns.date }}>TOTAL</Text>
				<Text
					style={{
						width: columns.credit,
						textAlign: "right",
						color: colors.credit
					}}
				>
					{formatMoney(totalCredit)}
				</Text>
				<Text
					style={{
						width: columns.debit,
						textAlign: "right",
						color: colors.debit
					}}
				>
					{formatMoney(totalDebit)}
				</Text>
			</View>
			<View style={[styles.row, styles.netRow]}>
				<Text style={{ width: columns.no }} />
				<Text style={{ width: columns.category }} />
				<Text style={{ width: columns.date }}>NET BALANCE</Text>
				<Text
					style={{
						width: "40%",
						textAlign: "right",
						color: net >= 0 ? colors.credit : colors.debit
					}}
				>
					{formatSignedMoney(net)}
				</Text>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		paddingVertical: 6,
		fontFamily: fonts.bold,
		fontSize: 10,
		lineHeight: 1.2,
		color: colors.ink
	},
	totalRow: { borderBottomWidth: 0.25, borderBottomColor: colors.ruleLight },
	netRow: { borderBottomWidth: 0.75, borderBottomColor: colors.ink }
})
