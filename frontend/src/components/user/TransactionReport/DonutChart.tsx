import { Circle, Path, StyleSheet, Svg, Text, View } from "@react-pdf/renderer"
import { colors, donut, fonts } from "./theme"

export interface DonutSlice {
	/** Share of the whole, 0..1. */
	share: number
	color: string
}

interface Props {
	slices: DonutSlice[]
	/** Small caption in the middle of the ring. */
	label?: string
	/** Pre-formatted total shown in the middle of the ring. */
	value: string
	valueColor: string
}

const { size, outerRadius: R, innerRadius: r, sliceGap } = donut
const C = size / 2

/** Angle 0 is 12 o'clock and grows clockwise. */
const polar = (radius: number, angle: number) => ({
	x: C + radius * Math.sin(angle),
	y: C - radius * Math.cos(angle)
})

const slicePath = (a0: number, a1: number) => {
	const large = a1 - a0 > Math.PI ? 1 : 0
	const o0 = polar(R, a0)
	const o1 = polar(R, a1)
	const i0 = polar(r, a0)
	const i1 = polar(r, a1)
	return [
		`M ${o0.x} ${o0.y}`,
		`A ${R} ${R} 0 ${large} 1 ${o1.x} ${o1.y}`,
		`L ${i1.x} ${i1.y}`,
		`A ${r} ${r} 0 ${large} 0 ${i0.x} ${i0.y}`,
		"Z"
	].join(" ")
}

export const DonutChart = ({
	slices,
	label = "TOTAL",
	value,
	valueColor
}: Props) => {
	const visible = slices.filter((s) => s.share > 0)
	let angle = 0
	return (
		<View style={styles.wrap}>
			<View style={styles.box}>
				<Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
					{visible.length === 1 ? (
						// A single slice would be a zero-length arc, so draw a plain ring instead.
						<>
							<Circle cx={C} cy={C} r={R} fill={visible[0].color} />
							<Circle cx={C} cy={C} r={r} fill="#FFFFFF" />
						</>
					) : (
						visible.map((s, i) => {
							const start = angle
							angle += s.share * Math.PI * 2
							return (
								<Path
									key={i}
									d={slicePath(start, angle)}
									fill={s.color}
									stroke="#FFFFFF"
									strokeWidth={sliceGap}
								/>
							)
						})
					)}
				</Svg>
				<View style={styles.center}>
					<Text style={styles.label}>{label}</Text>
					<Text style={[styles.value, { color: valueColor }]}>{value}</Text>
				</View>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	wrap: {
		alignItems: "center",
		marginTop: donut.marginTop,
		marginBottom: donut.marginBottom
	},
	box: { width: size, height: size },
	// Overlay centred on the ring; the hole is white, so plain text sits on it cleanly.
	center: {
		position: "absolute",
		top: 0,
		left: 0,
		width: size,
		height: size,
		alignItems: "center",
		justifyContent: "center"
	},
	label: {
		fontFamily: fonts.bold,
		fontSize: 7,
		lineHeight: 1.2,
		color: colors.muted
	},
	value: { fontFamily: fonts.bold, fontSize: 8.5, lineHeight: 1.2, marginTop: 2 }
})
