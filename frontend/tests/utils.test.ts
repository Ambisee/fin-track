import { groupData } from "@/lib/utils"
import { Entry } from "@/types/supabase"

describe("groupData tests", () => {
	const singleData: Partial<Entry>[] = [
        {date: "2023-02-02"}
    ]
    const normalData: Partial<Entry>[] = [
		{date: "2023-12-25"},
		{date: "2023-12-26"},
		{date: "2024-10-01"},
		{date: "2024-10-10" },
		{date: "2024-11-01" }
	]

	it("should correctly group the normal entry data", () => {
		const result = groupData(normalData as Entry[])
		expect(result).toEqual([
			{ month: "December", year: 2023, range: [0, 2] },
			{ month: "October", year: 2024, range: [2, 4] },
			{ month: "November", year: 2024, range: [4, 5] }
		])
	})

    it("should correctly group single entry data", () => {
        const result = groupData(singleData as Entry[])
        expect(result).toEqual([
            { month: "February", year: 2023, range: [0, 1] }
        ])
    })

    it("should correctly group empty entry data", () => {
        const result = groupData([])
        expect(result).toEqual([])
    })
})
