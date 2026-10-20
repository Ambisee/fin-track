import { StyleSheet, Text, View } from "@react-pdf/renderer"
import { colors, fonts, MM, pageSpacing } from "./theme"
import type { DateFormatter } from "./types"

export const PageFooter = ({
	formatDate,
	generatedAt = new Date()
}: {
	formatDate: DateFormatter
	generatedAt?: Date
}) => (
	<View style={styles.footer} fixed>
		<Text
			render={({ pageNumber, totalPages }) =>
				`Page ${pageNumber} of ${totalPages}`
			}
		/>
		<Text>{`Generated: ${formatDate(generatedAt)}`}</Text>
	</View>
)

const styles = StyleSheet.create({
	footer: {
		position: "absolute",
		left: pageSpacing.horizontal,
		right: pageSpacing.horizontal,
		bottom: 10 * MM,
		flexDirection: "row",
		justifyContent: "space-between",
		paddingTop: 5 * MM,
		borderTopWidth: 0.25,
		borderTopColor: colors.ruleLight,
		fontFamily: fonts.regular,
		fontSize: 8.5,
		color: colors.muted
	}
})
