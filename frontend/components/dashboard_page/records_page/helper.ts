import { monthArray } from "./constants";
import { EntryData } from "../../../firebase/types";

function sortData(entries: (EntryData & {id: string})[]) {
    if (entries.length === 0) {
        // return []
        return {}
    }
    
    const sortedData: {[month: string]: (EntryData & {id: string})[]} = {}
    // const sortedData: (EntryData & {id: string})[][] = []
    
    let i = 0
    let startIndex = 0
    let currentMonth = entries[0].date.getMonth()

    for (i = 0; i < entries.length; i++) {
        if (entries[i].date.getMonth() === currentMonth) {
            continue
        }

        sortedData[`${monthArray[currentMonth]} ${entries[i - 1].date.getFullYear()}`] = entries.slice(startIndex, i)
        // sortedData.push(entries.slice(startIndex, i))
        currentMonth = entries[i].date.getMonth()
        startIndex = i
    }
    
    sortedData[`${monthArray[currentMonth]} ${entries[i - 1].date.getFullYear()}`] = entries.slice(startIndex, entries.length)

    return sortedData
}

export { sortData }