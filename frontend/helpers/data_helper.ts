import { RealtimePostgresChangesPayload } from "@supabase/supabase-js"

import { Entry } from "@/supabase"

function handleDataChange(
    current: Entry[],
    payload: RealtimePostgresChangesPayload<Entry[]>
) {
    const newEntries: Entry[] = [...current]
    
    if (payload.eventType === "INSERT") {
        handleInsert(newEntries, payload)
    }

    if (payload.eventType === "DELETE") {
        handleDelete(newEntries, payload)
    }

    return newEntries
}

function handleDelete(
    newEntries: Entry[],
    payload: RealtimePostgresChangesPayload<Entry[]>
) {
    let index = -1;

    for (let i = 0; i < newEntries.length; i++) {
        if (newEntries[i].id == (payload.old as Entry).id) {
            index = i;
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
    let index = -1;
    const newEntry = payload.new

    for (let i = 1; i < newEntries.length; i++) {
        const newEntryDate = new Date((newEntry as Entry).date)
        const d1 = new Date(newEntries[i-1].date)
        const d2 = new Date(newEntries[i].date)

        // Set the `index` as `i` if the `Entry[i-1].date > newEntry.date > Entry[i].date`
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

export { handleDataChange }