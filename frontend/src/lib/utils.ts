import { Entry } from "@/types/supabase"
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { MONTHS } from "./constants"

interface MonthGroup {
    month: string,
    year: number,
    data: Entry[]
}

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function handleDataChange(
    current: Entry[],
    payload: RealtimePostgresChangesPayload<Entry[]>
) {
    const newEntries: Entry[] = [...current]
    
    switch(payload.eventType) {
        case "INSERT":
            handleInsert(newEntries, payload)
            break
        case "DELETE":
            handleDelete(newEntries, payload)
            break
        case "UPDATE":
            handleUpdate(newEntries, payload)
            break
        default:
            break
    }


    return newEntries
}

function handleUpdate(
    newEntries: Entry[],
    payload: RealtimePostgresChangesPayload<Entry[]>
) {
    let index = -1

    for (let i = 0; i < newEntries.length; i++) {
        if (newEntries[i].id === (payload.new as Entry).id) {
            index = i
            break
        }
    }

    if (index === -1) {
        return
    }

    newEntries[index] = {
        id: (payload.new as Entry).id,
        amount: (payload.new as Entry).amount,
        category: (payload.new as Entry).category,
        date: (payload.new as Entry).date,
        created_by: (payload.new as Entry).created_by,
        is_positive: (payload.new as Entry).is_positive,
        note: (payload.new as Entry).note,
        ledger: (payload.new as Entry).ledger
    }

    const newEntry = newEntries.splice(index, 1)[0]
    const newEntryDate = new Date(newEntry.date)
    
    index = -1

    if (
        newEntryDate.getTime() > new Date(newEntries[0].date).getTime()
    ) {
        newEntries.splice(0, 0, newEntry as Entry)
        return
    }

    for (let i = 1; i < newEntries.length; i++) {
        const d1 = new Date(newEntries[i - 1].date)
        const d2 = new Date(newEntries[i].date)

        if (
            (d1.getTime() > newEntryDate.getTime()) && 
            (newEntryDate.getTime() >= d2.getTime())
        ) {
            index = i
            break
        }
    }

    if (index == -1) {
        index = newEntries.length
    }

    newEntries.splice(index, 0, newEntry)
}

function handleDelete(
    newEntries: Entry[],
    payload: RealtimePostgresChangesPayload<Entry[]>
) {
    let index = -1

    for (let i = 0; i < newEntries.length; i++) {
        if (newEntries[i].id == (payload.old as Entry).id) {
            index = i
            break
        }
    }

    if (index == -1) {
        return
    }

    newEntries.splice(index, 1)
}

/**
 * Insert the new entry into the array based
 * on its date value.
 * 
 * @param newEntries the array to insert the new entry into
 * @param payload the object that contains the new entry
 */
function handleInsert(
    newEntries: Entry[], 
    payload: RealtimePostgresChangesPayload<Entry[]>
) {
    let index = -1
    const newEntry = payload.new
    const newEntryDate = new Date((newEntry as Entry).date)

    if (newEntries.length == 0) {
        newEntries.push(newEntry as Entry)
        return
    }

    if (
        newEntryDate.getTime() >= new Date(newEntries[0].date).getTime()
    ) {
        newEntries.splice(0, 0, newEntry as Entry)
        return
    }

    for (let i = 1; i < newEntries.length; i++) {
        const d1 = new Date(newEntries[i-1].date)
        const d2 = new Date(newEntries[i].date)

        
        if (
            (d1.getTime() > newEntryDate.getTime()) && 
            (newEntryDate.getTime() >= d2.getTime())
        ) {
            index = i
            break
        }
    }

    if (index == -1) {
        index = newEntries.length
    }

    newEntries.splice(index, 0, newEntry as Entry)
}

function groupData(data: Entry[]) {
    const result: {month: string, year: number, range: number[]}[] = []
    if (data.length < 1) {
        return result
    }

    const firstDate = new Date(data[0].date)
    result.push({month: MONTHS[firstDate.getMonth()], year: firstDate.getFullYear(), range: [0, 0]})

    for (let i = 1; i < data.length; i++) {
        const d = new Date(data[i].date)
        const lastGroup = result[result.length - 1]

        if (d.getMonth() === MONTHS.indexOf(lastGroup?.month) && d.getFullYear() === lastGroup.year) {
            continue
        }

        lastGroup.range[1] = i
        result.push({month: MONTHS[d.getMonth()], year: d.getFullYear(), range: [i, 0]})
    }

    result[result.length - 1].range[1] = data.length
    return result
}

/**
 * Group the entry data by each entry's months and years
 * 
 * @param data the entry data array
 * @returns {MonthGroup[]} the array of data groups
 */
function groupDataByMonth(
    data: Entry[]
) {
    const map: Map<string, Entry[]> = new Map()
    const result: MonthGroup[] = []

    for (let i = 0; i < data.length; i++) {
        const row_date = new Date(data[i].date)
        const row_date_str = row_date.toISOString().slice(0,7)

        if (!map.has(row_date_str)) {
            map.set(row_date_str, [])
        }

        map.get(row_date_str)?.push(data[i])
    }

    Array.from(map.keys()).forEach(key => {
        let group: MonthGroup = {month: '', year: 0, data: []}
        
        if (map.get(key) === undefined) {
            return
        }
        
        const d = new Date((map.get(key) as Entry[])[0].date)
        
        group.month = MONTHS[d.getUTCMonth()]
        group.year = d.getUTCFullYear()
        group.data = map.get(key) as Entry[]

        result.push(group)
    })

    return result
}

function getUsernameFromEmail(email: string) {
    const atSymbol = email.indexOf("@")
    if (atSymbol === -1) {
        return ""
    }

    
    let username = email.slice(0, atSymbol)
    return username.replace(/[^a-zA-Z0-9]/g, '')
}


function filterDataGroup(month: number, year: number, dataGroups: MonthGroup[]) {
    const today = new Date(year, month)
    
    let l = 0
    let r = dataGroups.length - 1
    let mid = l + Math.floor((r - l) / 2)

    while (l <=  r) {
        mid = l + Math.floor((r - l) / 2)
        const cur = new Date(dataGroups[mid].year, MONTHS.indexOf(dataGroups[mid].month))
    
        if (today.getMonth() === cur.getMonth() && today.getFullYear() === cur.getFullYear()) {
            return dataGroups[mid]
        }

        if (cur < today) {
            l = mid + 1
        } else {
            r = mid - 1
        }
    }

    return {
        month: MONTHS[today.getMonth()],
        year: today.getFullYear(),
        data: []
    }
}

function isFunction(value: any): value is Function { return typeof value === "function"}

export type {MonthGroup}
export {
    cn, getUsernameFromEmail, filterDataGroup, isFunction,
    handleDataChange, groupDataByMonth, groupData
}
