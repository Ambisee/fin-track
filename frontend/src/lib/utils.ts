import { twMerge } from "tailwind-merge"
import { type ClassValue, clsx } from "clsx"
import { Entry } from "@/types/supabase"
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js"

interface DataGroup {
    month: string,
    year: number,
    data: Entry[]
}

const months = [
    'January', 'February', 'March', 'April', 
    'May', 'June', 'July', 'August', 
    'September', 'October', 'November', 'December'
]

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
        title: (payload.new as Entry).title,
        date: (payload.new as Entry).date,
        created_at: (payload.new as Entry).created_at,
        created_by: (payload.new as Entry).created_by,
        amount_is_positive: (payload.new as Entry).amount_is_positive,
        note: (payload.new as Entry).note
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

/**
 * Group the entry data by each entry's months and years
 * 
 * @param data the entry data array
 * @returns {DataGroup[]} the array of data groups
 */
function sortDataByDateGroup(
    data: Entry[]
) {
    const map: Map<string, Entry[]> = new Map()
    const result: DataGroup[] = []

    for (let i = 0; i < data.length; i++) {
        const row_date = new Date(data[i].date)
        const row_date_str = row_date.toISOString().slice(0,7)

        if (!map.has(row_date_str)) {
            map.set(row_date_str, [])
        }

        map.get(row_date_str)?.push(data[i])
    }

    Array.from(map.keys()).forEach(key => {
        let group: DataGroup = {month: '', year: 0, data: []}
        
        if (map.get(key) === undefined) {
            return
        }
        
        const d = new Date((map.get(key) as Entry[])[0].date)
        
        group.month = months[d.getUTCMonth()]
        group.year = d.getUTCFullYear()
        group.data = map.get(key) as Entry[]

        result.push(group)
    })

    return result
}

function getElementFromNode(node: Node) {
    if (node instanceof Element) {
        return node;
    } else {
        console.log('The provided node is not an element.');
        return null;
    }
}

export { 
    cn,
    handleDataChange,
    sortDataByDateGroup,
    getElementFromNode
}