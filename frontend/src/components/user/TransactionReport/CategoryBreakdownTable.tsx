import { StyleSheet, Text, View } from "@react-pdf/renderer"
import type { AmountFormatter, CategoryStat } from "./types"
import { breakdownColumns as col, colors, fonts } from "./theme"
import { formatPercent } from "./format"

interface Props {
	stats: CategoryStat[]
	/** One swatch colour per stat, in the same order (matches the donut slices). */
	swatches: string[]
	/** Colour of the amount column: colors.credit or colors.debit. */
	amountColor: string
	formatAmount: AmountFormatter
}

const SWATCH_OFFSET = col.swatch + col.swatchGap

export const CategoryBreakdownTable = ({
	stats,
	swatches,
	amountColor,
	formatAmount
}: Props) => {
	const totalAmount = stats.reduce((s, x) => s + x.total, 0)
	const totalCount = stats.reduce((s, x) => s + x.count, 0)
	return (
		<View>
			<View style={[styles.row, styles.header]}>
				<Text style={[styles.grow, { paddingLeft: SWATCH_OFFSET }]}>
					CATEGORY
				</Text>
				<Text style={styles.qty}>QTY</Text>
				<Text style={styles.amount}>AMOUNT</Text>
				<Text style={styles.percent}>%</Text>
			</View>
			{stats.map((s, i) => (
				<View
					key={s.category}
					style={[
						styles.row,
						i === stats.length - 1 ? styles.rowLast : styles.rowMiddle
					]}
					wrap={false}
				>
					<View style={[styles.grow, styles.categoryCell]}>
						<View style={[styles.swatch, { backgroundColor: swatches[i] }]} />
						<Text style={styles.ink}>{s.category}</Text>
					</View>
					<Text style={[styles.qty, styles.ink]}>{s.count}</Text>
					<Text style={[styles.amount, { color: amountColor }]}>
						{formatAmount(s.total)}
					</Text>
					<Text style={[styles.percent, styles.muted]}>
						{formatPercent(s.share)}
					</Text>
				</View>
			))}
			<View style={[styles.row, styles.bold]} wrap={false}>
				<Text style={[styles.grow, styles.muted, { paddingLeft: SWATCH_OFFSET }]}>
					TOTAL
				</Text>
				<Text style={[styles.qty, styles.ink]}>{totalCount}</Text>
				<Text style={[styles.amount, { color: amountColor }]}>
					{formatAmount(totalAmount)}
				</Text>
				<Text style={[styles.percent, styles.muted]}>100%</Text>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		minHeight: col.rowHeight,
		fontFamily: fonts.regular,
		fontSize: col.fontSize,
		lineHeight: 1.2,
		color: colors.ink
	},
	header: {
		fontFamily: fonts.bold,
		color: colors.muted,
		borderBottomWidth: 0.5,
		borderBottomColor: colors.ink
	},
	rowMiddle: { borderBottomWidth: 0.25, borderBottomColor: colors.ruleLight },
	rowLast: { borderBottomWidth: 0.5, borderBottomColor: colors.ink },
	bold: { fontFamily: fonts.bold },
	ink: { color: colors.ink },
	muted: { color: colors.muted },
	grow: { flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0 },
	categoryCell: { flexDirection: "row", alignItems: "center" },
	swatch: {
		width: col.swatch,
		height: col.swatch,
		marginRight: col.swatchGap
	},
	qty: { width: col.qty, textAlign: "right" },
	amount: { width: col.amount, textAlign: "right" },
	percent: { width: col.percent, textAlign: "right", color: colors.muted }
})
