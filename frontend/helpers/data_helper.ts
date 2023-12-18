import { RealtimePostgresChangesPayload } from "@supabase/supabase-js"

import { Entry } from "@/supabase"

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
        default:
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
        description: (payload.new as Entry).description,
        date: (payload.new as Entry).date,
        created_at: (payload.new as Entry).created_at,
        created_by: (payload.new as Entry).created_by,
        amount_is_positive: (payload.new as Entry).amount_is_positive,
    }
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

export { handleDataChange }