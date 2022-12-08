import { QueryDocumentSnapshot, SnapshotOptions, Timestamp } from "firebase/firestore"

/** --- Entry class and converter --- */
class Entry {
    date: Date
    detail: string
    amount: Money

    /**
     * Entry class constructor
     * 
     * @param date The date of the transaction record
     * @param detail The detail of the transaction record
     * @param amount The amount of the transaction record
     */
    constructor(date: Date, detail: string, amount: Money) {
        this.date = date
        this.detail = detail
        this.amount = amount
    }

    /**
     * Get the object containing the Entry's instance variables
     * 
     * @return The object that contains the Entry's instance variables
     */
    getData(): {date: Date, detail: string, amount: string} {
        return {
            date: this.date,
            detail: this.detail,
            amount: this.amount.getFloatString()
        }
    }
}

const entryConverter = {
    /**
     * Converts an Entry object to a format tha can be stored 
     * in Firestore
     * 
     * @param entry The entry object to be converted to a query to be stored in Firestore
     * @return The object that contains the Entry's instance variable
     */
    toFirestore: (entry: Entry): {date: Timestamp, detail: string, amount: string} => {
        return {
            date: Timestamp.fromDate(entry.date),
            detail: entry.detail,
            amount: entry.amount.getFloatString()
        }
    },
    /**
     * Converts an entry query from Firestore to an Entry object
     * 
     * @param snapshot The query from Firestore to be converted
     * @param options The options to be applied to the query
     * @return The Entry object that represent the query's data
     */
    fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions) : Entry => {
        const data = snapshot.data(options)
        return new Entry(data.date.toDate(), data.detail, new Money(data.amount))
    }
}

/** --- Money class and converter */
class Money {
    currency: string
    primary: number
    secondary: number

    /**
     * Check if the given string is a valid balance
     * 
     * @param amount The string that denotes the amount to be checked
     * @return The boolean value denoting whether or not the amount string given
     *      is valid
     */
    static isValidAmount(amount: string) : boolean {
        let money: string[] = amount.split('.')
        let result: number[]

        if (money[1] == undefined) 
            return false
        
        result = money.map((value) => Number.parseInt(value))

        if (result.filter((value) => Number.isNaN(value)).length > 0) 
            return false

        if (result[1] < 0 || result[1] > 100)
            return false

        return true
    }

    /**
     * The Money class constructor
     * 
     * @param value The value of the money
     * @param currency The currency of the money object
     */
    constructor(value: string, currency: string = 'cad') {
        [this.primary, this.secondary] = value.split('.').map((value) => Number(value))
        this.currency = currency
    }

    /**
     * Recount excess `secondary` value of the money 
     * into `primary` value
     * 
     * @param money The Money object to recalculate 
     * @return None
     */
    handleExcessSecondary(money: Money) : void {
        // <!-- Temporary handler for when secondary goes above a certain threshold
        const primaryConversion = Math.floor(money.secondary / 100)
        const remainder = money.secondary - (100 * primaryConversion)
        // -->

        money.primary += primaryConversion
        money.secondary = remainder
    }

    /**
     * Get the string representation of the Money's value
     * 
     * @return The string representation of the value
     */
    getFloatString() : string {
        return `${this.primary}.${this.secondary}`
    }

    /**
     * Add the value of two Money object
     * 
     * @param target_money The Money object where the sum of two Money's value will be stored
     * @param other The second Money object whose value is added from
     * @return None
     */
    addValue(target_money: Money, other: Money) : void {
        target_money.primary += other.primary
        target_money.secondary += other.secondary
        
        this.handleExcessSecondary(target_money)
    }

    /**
     * Sum the values of one or more Money object and store it into a new Money object 
     * 
     * @param others Money object(s) whose values is to be summed
     * @return The Money object containing the sum of all values  of Money from `others`
     */
    sumValue(others: Money | Money[]) : Money {
        const sum = new Money('0')

        if (others instanceof Money) {
            sum.addValue(sum, others)
            return sum
        }

        for (let i = 0; i < others.length; i++) {
            sum.addValue(sum, others[i])
        }
        return sum
    }
}


export {
    Money,
    Entry,
    entryConverter
}