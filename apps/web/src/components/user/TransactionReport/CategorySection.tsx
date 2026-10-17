import { StyleSheet, Text, View } from "@react-pdf/renderer"
import type { AmountFormatter, CategoryStat } from "./types"
import { colors, fonts, palettes, shadeRamp } from "./theme"
import { DonutChart } from "./DonutChart"
import { CategoryBreakdownTable } from "./CategoryBreakdownTable"

interface Props {
	kind: "credit" | "debit"
	stats: CategoryStat[]
	formatAmount: AmountFormatter
}

/** One half of the summary page: heading, donut chart and breakdown table. */
export const CategorySection = ({ kind, stats, formatAmount }: Props) => {
	const palette = palettes[kind]
	const amountColor = colors[kind]
	const swatches = shadeRamp(palette.from, palette.to, stats.length)
	const total = stats.reduce((s, x) => s + x.total, 0)

	return (
		<View style={styles.wrap}>
			<Text style={styles.heading}>{`${kind.toUpperCase()} BY CATEGORY`}</Text>
			{stats.length === 0 ? (
				<Text style={styles.empty}>{`No ${kind} entries`}</Text>
			) : (
				<>
					<DonutChart
						slices={stats.map((s, i) => ({ share: s.share, color: swatches[i] }))}
						value={formatAmount(total)}
						valueColor={amountColor}
					/>
					<CategoryBreakdownTable
						stats={stats}
						swatches={swatches}
						amountColor={amountColor}
						formatAmount={formatAmount}
					/>
				</>
			)}
		</View>
	)
}

const styles = StyleSheet.create({
	wrap: { flex: 1, minWidth: 0 },
	heading: {
		fontFamily: fonts.bold,
		fontSize: 10,
		lineHeight: 1.2,
		color: colors.ink,
		paddingBottom: 4,
		borderBottomWidth: 0.75,
		borderBottomColor: colors.ink
	},
	empty: {
		marginTop: 16,
		fontFamily: fonts.regular,
		fontSize: 8,
		color: colors.muted
	}
})
