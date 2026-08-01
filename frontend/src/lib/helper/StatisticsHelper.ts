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

interface Statistics {
	totalIncome: number
	totalExpense: number
	groups: StatisticGroup[]
}

interface StatisticGroup {
	category: string
	isPositive: boolean
	totalAmount: number
	percentage: number
}

class StatisticsHelper {
	static calculateStatistics(entryData: Entry[]): Statistics {
		const result: Statistics = {
			totalIncome: 0,
			totalExpense: 0,
			groups: []
		}

		const groupMap: { [key: string]: StatisticGroup } = {}

		for (let i = 0; i < entryData.length; i++) {
			const entry = entryData[i]
			const groupKey = `${entry.category}_${entry.is_positive}`

			if (!(groupKey in groupMap)) {
				groupMap[groupKey] = {
					category: entry.category,
					isPositive: entry.is_positive,
					totalAmount: 0,
					percentage: 0
				}
			}

			groupMap[groupKey].totalAmount += entry.amount
			if (entry.is_positive) {
				result.totalIncome += entry.amount
			} else {
				result.totalExpense += entry.amount
			}
		}

		result.groups = Object.values(groupMap)

		for (let i = 0; i < result.groups.length; i++) {
			const group = result.groups[i]
			const total = group.totalAmount
			const totalOverall = group.isPositive
				? result.totalIncome
				: result.totalExpense

			result.groups[i].percentage = total / totalOverall
		}

		return result
	}

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

export {
	StatisticsHelper,
	type StatisticGroup,
	type Statistics,
	type TotalByDay
}
