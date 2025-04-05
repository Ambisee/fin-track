import { ENTRY_QKEY, STATISTICS_QKEY } from "../constants"

class QueryHelper {

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