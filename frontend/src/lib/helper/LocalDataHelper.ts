import { Entry, Statistic } from "@/types/supabase"
import { isNonNullable } from "../utils"
import { DateHelper } from "./DateHelper"

class LocalDataHelper {
	private static isEntryInOrder(e1: Entry, e2: Entry): boolean {
		const d1 = new Date(e1.date)
		const d2 = new Date(e2.date)

		// Check if dates are in descending order
		if (d1 > d2) {
			return true
		} else if (d1 < d2) {
			return false
		}

		// Check if categories are in descending order
		if (e1.category > e2.category) {
			return true
		} else if (e1.category < e2.category) {
			return false
		}

		// Check if the ids are in ascending order
		return e1.id < e2.id
	}

	/**
	 * Find the position in the local data to insert a new entry.
	 *
	 * @param localData The local data store to search through
	 * @param data The new data to apply the insertion.
	 * @returns An integer representing the index to insert the data into.
	 */
	private static findInsertEntryPosition(
		localData: Entry[],
		data: Entry
	): number {
		if (localData.length < 1) {
			return 0
		}

		if (this.isEntryInOrder(data, localData[0])) {
			return 0
		} else if (this.isEntryInOrder(localData[localData.length - 1], data)) {
			return localData.length
		}

		let left = 0
		let right = localData.length - 1

		let result = -1
		while (left <= right) {
			let mid = left + Math.floor((right - left) / 2)
			if (this.isEntryInOrder(data, localData[mid])) {
				result = mid
				right = mid - 1
			} else {
				left = mid + 1
			}
		}

		return result
	}

	/**
	 * Find the position in the local data to delete an existing entry
	 *
	 * @param localData The local data store to search through
	 * @param data The old data to apply the deletion.
	 * @returns An integer representing the index for deletion.
	 */
	private static findDeleteEntryPosition(
		localData: Entry[],
		data: Entry
	): number {
		if (localData.length < 1) {
			return -1
		}

		let left = 0
		let right = localData.length - 1

		while (left <= right) {
			let mid = left + Math.floor((right - left) / 2)
			if (localData[mid].id == data.id) {
				return mid
			}

			if (this.isEntryInOrder(data, localData[mid])) {
				right = mid - 1
			} else {
				left = mid + 1
			}
		}

		return -1
	}

	public static insertEntry(localData: Entry[], newEntry: Entry): Entry[] {
		const newLocalData = [...localData]
		const insertIndex = this.findInsertEntryPosition(localData, newEntry)

		newLocalData.splice(insertIndex, 0, newEntry)
		return newLocalData
	}

	public static deleteEntry(localData: Entry[], oldEntry: Entry): Entry[] {
		const newLocalData = [...localData]
		const deleteIndex = this.findDeleteEntryPosition(localData, oldEntry)

		if (deleteIndex == -1) {
			throw Error(
				`Error happened when deleting an entry. localData: ${localData.length} entries`
			)
		}

		newLocalData.splice(deleteIndex, 1)
		return newLocalData
	}

	public static updateEntry(
		localData: Entry[],
		newEntry: Entry,
		oldEntry: Entry
	) {
		let newLocalData = this.deleteEntry(localData, oldEntry)
		return this.insertEntry(newLocalData, newEntry)
	}

	public static addToStatistic(statistics: Statistic[], entry: Entry) {
		const newData = [...statistics]
		const index = newData.findIndex(
			(statistic) =>
				statistic.category === entry.category &&
				statistic.is_positive === entry.is_positive
		)

		const statGroup = newData[index]
		if (isNonNullable(statGroup?.total_amount)) {
			newData.splice(index, 1, {
				...statGroup,
				total_amount: statGroup.total_amount + entry.amount
			})
		} else {
			newData.push({
				category: entry.category,
				total_amount: entry.amount,
				is_positive: entry.is_positive,
				ledger: entry.ledger,
				created_by: entry.created_by,
				period: DateHelper.toDatabaseString(
					DateHelper.getMonthStartEnd(new Date(entry.date)).start
				)
			})
		}

		return newData
	}

	public static deleteFromStatistic(statistics: Statistic[], entry: Entry) {
		const newData = [...statistics]
		const index = newData.findIndex(
			(statistic) =>
				statistic.category === entry.category &&
				statistic.is_positive === entry.is_positive
		)

		if (!isNonNullable(newData[index]?.total_amount)) {
			throw Error(
				`Error happened when removing an entry from statistic. is_positive? ${entry.is_positive}, category: ${entry.category}`
			)
		}

		newData[index].total_amount -= entry.amount
		if (newData[index].total_amount === 0) {
			newData.splice(index)
		} else {
			newData.splice(index, 1, { ...newData[index] })
		}

		return newData
	}
}

export { LocalDataHelper }
