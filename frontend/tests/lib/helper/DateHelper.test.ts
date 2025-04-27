import { DateHelper } from "@/lib/helper/DateHelper"

interface TestCase<I, E> {
	input: I
	expected: E
}

describe("DateHelper tests", () => {
	const testcases: TestCase<Date, string>[] = [
		{ input: new Date("2024-12-12"), expected: "2024-12-12" },
		{ input: new Date("2024/01/01"), expected: "2024-01-01" },
		{ input: new Date("2024.02.01"), expected: "2024-02-01" },
		{ input: new Date("May 31, 2024"), expected: "2024-05-31" },
		{ input: new Date("02, 28, 2025"), expected: "2025-02-28" }
	]

	it("should format date strings into Postgres' date format", () => {
        for (let i = 0; i < testcases.length; i++) {
            const actual = DateHelper.toDatabaseString(testcases[i].input)
            expect(actual).toEqual(testcases[i].expected)
        }
    })
})
