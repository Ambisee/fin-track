import { StyleSheet, Text, View } from "@react-pdf/renderer"
import type { DocumentInfo } from "./types"
import { colors, fonts, infoSection, MM } from "./theme"

export type InfoField = "username" | "ledger" | "period" | "currency"

const ALL_FIELDS: InfoField[] = ["username", "ledger", "period", "currency"]

export const DocumentInfoSection = ({
	username,
	ledger,
	period,
	currency,
	locale,
	fields = ALL_FIELDS
}: DocumentInfo & {
	/** Which rows to show (always in the order username, ledger, period, currency). Default: all. */
	fields?: InfoField[]
}) => {
	const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "long" })
	return (
		<View style={styles.wrap}>
			{fields.includes("username") && (
				<InfoRow label="USERNAME" value={username} />
			)}
			{fields.includes("ledger") && <InfoRow label="LEDGER" value={ledger} />}
			{fields.includes("period") && (
				<InfoRow
					label="PERIOD"
					value={`${dateFormatter.format(period.from)} - ${dateFormatter.format(period.to)}`}
				/>
			)}
			{fields.includes("currency") && (
				<InfoRow label="CURRENCY" value={currency} />
			)}
		</View>
	)
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
	<View style={styles.row}>
		<Text style={styles.label}>{label}</Text>
		{/* Long values wrap onto new lines inside the value column, never under the label */}
		<Text style={styles.value}>{value}</Text>
	</View>
)

const styles = StyleSheet.create({
	wrap: { marginBottom: 10 * MM },
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
