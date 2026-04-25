import { Entry } from "@/types/supabase"
import { isNonNullable } from "../utils"
import { DateHelper } from "./DateHelper"

interface TotalSpendingByDay {
	date: Date
	totalSpending: number
}

interface TotalSpendingByCategory {
	category: string
	totalSpending: number
}

class StatisticsHelper {
	static groupTotalSpendingByDate(entryData: Entry[]): TotalSpendingByDay[] {
		const result: TotalSpendingByDay[] = []

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
				totalSpendingByDay = { date: entryDate, totalSpending: 0 }
				result.push(totalSpendingByDay)
			}

			totalSpendingByDay.totalSpending += entry.amount
		}

		return result
	}

	static groupTotalSpendingByCategory(
		entryData: Entry[]
	): TotalSpendingByCategory[] {
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

		const result: TotalSpendingByCategory[] = []
		for (const key in counter) {
			result.push({ category: key, totalSpending: counter[key] })
		}
		return result
	}
}

export { type TotalSpendingByDay, StatisticsHelper }
