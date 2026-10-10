import { StyleSheet, Text, View } from "@react-pdf/renderer"
import type { DocumentInfo } from "./types"
import { colors, fonts, infoSection, MM } from "./theme"
import { breakLongWords } from "./format"

const dateFormatter = new Intl.DateTimeFormat(navigator.language, {
	dateStyle: "long"
})

export const DocumentInfoSection = ({
	username,
	ledger,
	period
}: DocumentInfo) => (
	<View style={styles.wrap}>
		<InfoRow label="USERNAME" value={username} />
		<InfoRow label="LEDGER" value={ledger} />
		<InfoRow
			label="PERIOD"
			value={`${dateFormatter.format(period.from)} - ${dateFormatter.format(period.to)}`}
		/>
	</View>
)

const InfoRow = ({ label, value }: { label: string; value: string }) => (
	<View style={styles.row}>
		<Text style={styles.label}>{label}</Text>
		<Text style={styles.value}>{value}</Text>
	</View>
)

const styles = StyleSheet.create({
	wrap: { marginBottom: 10 * MM, width: "100%" },
	row: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 2 },
	// Fixed-width label that can never shrink, so every value starts at the same x position.
	label: {
		width: infoSection.labelWidth,
		flexGrow: 0,
		flexShrink: 0,
		fontFamily: fonts.bold,
		fontSize: infoSection.fontSize,
		lineHeight: 1.4,
		color: colors.muted
	},
	// Takes the remaining width; minWidth 0 lets the text wrap instead of pushing the layout.
	value: {
		flexGrow: 1,
		flexShrink: 1,
		flexBasis: 0,
		minWidth: 0,
		fontFamily: fonts.regular,
		fontSize: infoSection.fontSize,
		lineHeight: 1.4,
		color: colors.ink
	}
})
