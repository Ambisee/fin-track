import { DateHelper, DateRange } from "@/lib/helper/DateHelper"

interface TestCase<I, E> {
	input: I
	expected: E
}

interface GetWeekStartEndInput {
	date: Date
	locale: string
}

describe("DateHelper tests", () => {
	describe("toDateString tests", () => {
		const testcases: TestCase<Date, string>[] = [
			{ input: new Date("2024-12-12"), expected: "2024-12-12" },
			{ input: new Date("2024/01/01"), expected: "2024-01-01" },
			{ input: new Date("2024.02.01"), expected: "2024-02-01" },
			{ input: new Date("May 31, 2024"), expected: "2024-05-31" },
			{ input: new Date("02, 28, 2025"), expected: "2025-02-28" }
		]

		it.each(testcases)(
			"should return the correct Postgres date representation for input: [date] $input",
			({ input, expected }) => {
				const actual = DateHelper.toDatabaseString(input)
				expect(actual).toEqual(expected)
			}
		)
	})

	describe("getMonthStartEnd tests", () => {
		const testcases: TestCase<Date, DateRange>[] = [
			{
				input: new Date("2025-12-12"),
				expected: {
					from: new Date("2025-12-01, 00:00:00.000"),
					to: new Date("2025-12-31, 23:59:59.999")
				}
			},
			{
				input: new Date("2026-01-14"),
				expected: {
					from: new Date("2026-01-01, 00:00:00.000"),
					to: new Date("2026-01-31, 23:59:59.999")
				}
			}
		]

		it.each(testcases)(
			"should return the correct timestamp for input: [date] $input",
			({ input, expected }) => {
				const actual = DateHelper.getMonthStartEnd(input)
				expect(actual).toEqual(expected)
			}
		)
	})

	describe("getWeekStartEnd tests", () => {
		const idLocale = "id"
		const usLocale = "en-us"
		const euLocale = "en-eu"
		const egyptLocale = "ar-eg"

		const testcases: TestCase<GetWeekStartEndInput, DateRange>[] = [
			{
				input: {
					date: new Date("2025-12-12"),
					locale: idLocale
				},
				expected: {
					from: new Date("2025-12-07, 00:00:00.000"),
					to: new Date("2025-12-13, 23:59:59.999")
				}
			},
			{
				input: {
					date: new Date("2024/02/25"),
					locale: idLocale
				},
				expected: {
					from: new Date("2024-02-25, 00:00:00.000"),
					to: new Date("2024-03-02, 23:59:59.999")
				}
			},
			{
				input: {
					date: new Date("2024.03.31"),
					locale: usLocale
				},
				expected: {
					from: new Date("2024-03-31, 00:00:00.000"),
					to: new Date("2024-04-06, 23:59:59.999")
				}
			},
			{
				input: {
					date: new Date("2023-10-06"),
					locale: egyptLocale
				},
				expected: {
					from: new Date("2023-09-30, 00:00:00.000"),
					to: new Date("2023-10-06, 23:59:59.999")
				}
			},
			{
				input: {
					date: new Date("2023-06-29"),
					locale: euLocale
				},
				expected: {
					from: new Date("2023-06-26, 00:00:00.000"),
					to: new Date("2023-07-02, 23:59:59.999")
				}
			}
		]

		it.each(testcases)(
			"should return the correct timestamp range: [date] $input.date, [locale] $input.locale",
			({ input, expected }) => {
				const locale = new Intl.Locale(input.locale)
				const actual = DateHelper.getWeekStartEnd(input.date, locale)
				expect(actual).toEqual(expected)
			}
		)
	})
})
