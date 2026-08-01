import { Entry } from "@/types/supabase"
import { isNonNullable } from "../utils"
import { DateHelper } from "./DateHelper"

interface TotalByDay {
	date: Date
	total: number
}

interface TotalByCategory {
	category: string
	total: number
}

class StatisticsHelper {
	static groupTotalSpendingByDate(entryData: Entry[]): TotalByDay[] {
		const result: TotalByDay[] = []

		for (let i = 0; i < entryData.length; i++) {
			const entry = entryData[i]
			if (entry.is_positive) {
				continue
			}

			const entryDate = new Date(entry.date)
			let totalSpendingByDay = result.at(-1)

			if (
				!isNonNullable(totalSpendingByDay) ||
				!DateHelper.isDateEqual(totalSpendingByDay.date, entryDate)
			) {
				totalSpendingByDay = { date: entryDate, total: 0 }
				result.push(totalSpendingByDay)
			}

			totalSpendingByDay.total += entry.amount
		}

		return result
	}

	static groupTotalSpendingByCategory(entryData: Entry[]): TotalByCategory[] {
		const counter: { [key: string]: number } = {}

		for (let i = 0; i < entryData.length; i++) {
			const entry = entryData[i]
			if (entry.is_positive) {
				continue
			}

			let currentCount = counter[entry.category]
			if (currentCount === undefined) {
				counter[entry.category] = 0
				currentCount = 0
			}

			counter[entry.category] += entry.amount
		}

		const result: TotalByCategory[] = []
		for (const key in counter) {
			result.push({ category: key, total: counter[key] })
		}
		return result
	}
}

export { type TotalByDay, StatisticsHelper }
