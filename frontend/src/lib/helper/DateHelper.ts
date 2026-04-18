type DateRange = { from: Date; to: Date }

class DateHelper {
	static toDatabaseString(date: Date): string {
		const year = String(date.getFullYear())
		const month = String(date.getMonth() + 1).padStart(2, "0")
		const day = String(date.getDate()).padStart(2, "0")

		return `${year}-${month}-${day}`
	}

	static getMonthStartEnd(date: Date): DateRange {
		const from = new Date(date)
		from.setDate(1)

		const to = new Date(date)
		to.setMonth(to.getMonth() + 1)
		to.setDate(0)

		return { from, to }
	}
}

export { type DateRange, DateHelper }
