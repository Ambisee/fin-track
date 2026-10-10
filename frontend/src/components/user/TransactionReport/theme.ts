// All values are measured from the PDF template (A4, 20mm margins, Courier).
export const fonts = { regular: "Courier", bold: "Courier-Bold" } as const

export const colors = {
	ink: "#000000",
	muted: "#555555",
	ruleLight: "#BBBBBB",
	credit: "#1B6E2D",
	debit: "#B3261E"
} as const

export const MM = 2.8346 // 1 mm in points

export const pageSpacing = {
	horizontal: 20 * MM,
	top: 20 * MM,
	bottom: 28 * MM // space reserved for the footer
} as const

// Column widths (percentage of content width) – shared by the header, rows, and summary.
export const columns = {
	no: "10.6%",
	category: "29.4%",
	date: "20%",
	debit: "20%",
	credit: "20%"
} as const

// Document info section (label/value rows on page 1).
export const A4_WIDTH = 595.28
export const infoSection = {
	labelWidth: 35 * MM,
	fontSize: 10,
	/** Courier glyphs are 0.6em wide, so we can compute exactly how many characters fit on a line. */
	get valueMaxChars() {
		const valueWidth = A4_WIDTH - 2 * pageSpacing.horizontal - this.labelWidth
		return Math.floor(valueWidth / (0.6 * this.fontSize))
	}
} as const
