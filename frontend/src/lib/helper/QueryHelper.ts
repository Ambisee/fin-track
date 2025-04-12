import { ENTRY_QKEY, STATISTICS_QKEY } from "../constants"

class QueryHelper {
    static readonly MESSAGE_NO_USER = "No user data found."
    static readonly MESSAGE_NO_SETTINGS = "No settings data found."
    static readonly MESSAGE_NO_LEDGER = "No ledger provided."
    static readonly MESSAGE_REQUIRE_AT_LEAST_ONE_LEDGER = "User must have at least one ledger."

    static getEntryQueryKey(ledger?: number, period: Date = new Date()) {
        const queryKey = [...ENTRY_QKEY]
            queryKey.push(`${ledger}`)
            queryKey.push(`${period.getMonth() + 1}-${period.getFullYear()}`)
        
            return queryKey
    }

    static getStatisticQueryKey(ledger?: number, period?: Date) {    
        const queryKey = [...STATISTICS_QKEY]
        queryKey.push(`${ledger}`)
        queryKey.push(`${period?.getMonth()}-${period?.getFullYear()}`)
    
        return queryKey
    }

}

export { QueryHelper }