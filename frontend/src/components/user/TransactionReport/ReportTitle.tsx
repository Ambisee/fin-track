import { StyleSheet, Text, View } from "@react-pdf/renderer"
import { colors, fonts, MM } from "./theme"

export const ReportTitle = ({
	title = "FINANCIAL REPORT"
}: {
	title?: string
}) => (
	<View style={styles.wrap}>
		<Text style={styles.title}>{title}</Text>
		<View style={styles.rule} />
	</View>
)

const styles = StyleSheet.create({
	wrap: { marginBottom: 5 * MM },
	title: {
		fontFamily: fonts.bold,
		fontSize: 22,
		lineHeight: 26 / 22,
		color: colors.ink
	},
	rule: { marginTop: 4 * MM, borderTopWidth: 3, borderTopColor: colors.ink }
})
