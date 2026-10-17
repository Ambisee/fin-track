type DateRange = { from?: Date | undefined; to?: Date | undefined }

interface UTS35WeekElement {
	firstDay: number
	weekends: [number]
}

class DateHelper {
	private static formatter: Intl.DateTimeFormat = new Intl.DateTimeFormat(
		navigator.language,
		{
			day: "2-digit"
		}
	)

	static toDatabaseString(date: Date): string {
		const year = String(date.getFullYear())
		const month = String(date.getMonth() + 1).padStart(2, "0")
		const day = String(date.getDate()).padStart(2, "0")

		return `${year}-${month}-${day}`
	}

	static toShortDateString(date: Date): string {
		return DateHelper.formatter.format(date)
	}

	static toShortString(date: Date): string {
		const formatter = new Intl.DateTimeFormat(navigator.language, {
			dateStyle: "short"
		})

		return formatter.format(date)
	}

	static toFullString(
		date: Date,
		locale: Intl.DateTimeFormat = new Intl.DateTimeFormat(navigator.language, {
			dateStyle: "long"
		})
	): string {
		return locale.format(date)
	}

	static getYearStartEnd(date: Date): DateRange {
		const from = new Date(date)
		from.setMonth(0)
		from.setDate(1)

		const to = new Date(date)
		to.setMonth(12)
		to.setDate(0)

		return { from, to }
	}

	/**
	 * Return the the timestamp ranges of the given date's month.
	 *
	 * @param date
	 * @returns
	 */
	static getMonthStartEnd(date: Date): DateRange {
		const from = new Date(date)
		from.setDate(1)
		from.setHours(0, 0, 0, 0)

		const to = new Date(date)
		to.setHours(0, 0, 0, 0)
		to.setMonth(to.getMonth() + 1)
		to.setDate(1)
		to.setTime(to.getTime() - 1)

		return { from, to }
	}

	static getWeekStartEnd(
		date: Date,
		locale: Intl.Locale = new Intl.Locale(navigator.language)
	): DateRange {
		// Defaults to Monday as the first day of the week.
		let firstDayOfTheWeek = 1

		// Checks for available web APIs for retrieving UTS25WeekElement info.
		if ("getWeekInfo" in locale && typeof locale.getWeekInfo === "function") {
			const weekInfo: UTS35WeekElement = locale.getWeekInfo()
			firstDayOfTheWeek = weekInfo.firstDay
		} else if (
			"weekInfo" in locale &&
			typeof locale.weekInfo === "object" &&
			locale.weekInfo !== null &&
			"firstDay" in locale.weekInfo &&
			typeof locale.weekInfo.firstDay === "number"
		) {
			firstDayOfTheWeek = locale.weekInfo.firstDay
		}

		firstDayOfTheWeek -= 1 // Project to the range of [0,6] instead.

		// Get current day in the range of [0, 6] (Sunday to Saturday).
		let day = date.getDay()

		// Convert current day to range [0, 6] (Monday to Saturday).
		if (day < 1) {
			day = 7
		}
		day -= 1

		const offset = (firstDayOfTheWeek - (day + 7)) % 7

		const from = new Date(date)
		from.setDate(date.getDate() + offset)
		from.setHours(0, 0, 0, 0)

		const to = new Date(from)
		to.setDate(from.getDate() + 7)
		to.setHours(0, 0, 0, 0)
		to.setTime(to.getTime() - 1)

		return { from, to }
	}

	static getDateStartEnd(date: Date): DateRange {
		return { from: date, to: date }
	}

	static getYesterdayStartEnd(today: Date): DateRange {
		const yesterday = new Date(today)
		yesterday.setDate(today.getDate() - 1)
		return { from: yesterday, to: yesterday }
	}

	static getLast7DaysStartEnd(today: Date): DateRange {
		const to = new Date(today)
		const from = new Date(today)
		from.setDate(today.getDate() - 6)

		return { from, to }
	}

	static isDateEqual(d1: Date, d2: Date): boolean {
		let answer = true
		answer &&= d1.getDate() == d2.getDate()
		answer &&= d1.getMonth() == d2.getMonth()
		answer &&= d1.getFullYear() == d2.getFullYear()
		return answer
	}
}

export { type DateRange, DateHelper }
