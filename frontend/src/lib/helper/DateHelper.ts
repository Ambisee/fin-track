class DateHelper {
    
    static toDatabaseString(date: Date): string {
        const year = String(date.getFullYear())
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')

        return `${year}-${month}-${day}`
    }

    static getMonthStartEnd(date: Date): { start: Date, end: Date } {
        const start = new Date(date)
        const end = new Date(date)
    
        start.setDate(1)
    
        end.setMonth(end.getMonth() + 1)
        end.setDate(0)
    
        return { start, end }
    }

}

export { DateHelper }