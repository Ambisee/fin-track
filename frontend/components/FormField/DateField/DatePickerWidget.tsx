import { useState, forwardRef, ChangeEventHandler } from "react"
import { v4 as uuidv4 } from "uuid"

import styles from "./DatePicker.module.css"

interface DatePickerWidgetProps {
    onChange: (arg: string) => void
}

const DatePickerWidget = forwardRef(function DatePickerWidget({
    onChange
}: DatePickerWidgetProps, ref) {
    const today = new Date()

    const [compValue, setCompValue] = useState(today.toLocaleDateString('en-ca'))
    const [date, setDate] = useState(today.getDate())
    const [month, setMonth] = useState(today.getMonth() + 1)
    const [year, setYear] = useState(today.getUTCFullYear())

    const setDateValue = (date: number, month: number, year: number) => {
        const newValue = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`
        setCompValue(newValue)
        if (onChange !== undefined) {
            onChange(newValue)
        }
    }

    const getNumDays = (month: number, year: number) => {
        return new Date(year, month, 0).getDate()
    }
    
    const getStartDay = (month: number, year: number) => {
        return new Date(year, month - 1, 1).getDay()
    }
    
    const computeDatePositions = (month: number, year: number) => {
        if (month > 12 || month < 1) {
            return []
        }

        const numDays = getNumDays(month, year)
        const startDay = getStartDay(month, year)

        let dayCounter = 1
        const nodeResult: number[][] = []
    
        for (let i = 0; i < 6; i++) {
            nodeResult.push([])
            for (let j = 0; j < 7; j++) {
                if (
                    (i == 0 && j < startDay) ||
                    (dayCounter > numDays)
                ) {
                    nodeResult[i].push(0)
                } else {
                    nodeResult[i].push(dayCounter)
                    dayCounter++
                }
            }
        }
    
        return nodeResult
    }

    const renderCalendar = (month: number, year: number) => {
        const calendarArr = computeDatePositions(month, year)
        
        if (calendarArr.length == 0) {
            return
        }

        const nodeResult = []
        const m = month
        const y = year

        for (const row of calendarArr) {
            nodeResult.push(
                <tr key={uuidv4()}>
                    {row.map((val) => {
                        if (val === 0) {
                            return <td key={uuidv4()}>

                            </td>
                        }
                        return (
                            <td key={uuidv4()}>
                                <button
                                    className={`
                                        ${(
                                            val == date &&
                                            month == m &&
                                            year == y
                                        ) && styles["current-date"]}
                                    `}
                                    onClick={() => {
                                        setMonth(m)
                                        setYear(y)
                                        setDate(val)
                                        setDateValue(val, month, year)
                                    }}
                                >
                                    {val}
                                </button>
                            </td>
                        )
                    })}
                </tr>
            )
        }

        return nodeResult
    }

    return (
        <>
            <div 
                className={styles["container"]}
            >
                <div className={styles["month-year-display"]}>
                    <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                        <option value={1}>January</option>
                        <option value={2}>February</option>
                        <option value={3}>March</option>
                        <option value={4}>April</option>
                        <option value={5}>May</option>
                        <option value={6}>June</option>
                        <option value={7}>July</option>
                        <option value={8}>August</option>
                        <option value={9}>September</option>
                        <option value={10}>October</option>
                        <option value={11}>November</option>
                        <option value={12}>December</option>
                    </select>
                    <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
                        {
                            (() => {
                                const years = []

                                for (let i = -50; i <= 50; i++) {
                                    years.push(
                                        <option key={uuidv4()} value={year + i}>{year + i}</option>
                                    )
                                }

                                return years
                            })()
                        }
                    </select>
                </div>
                <div>
                    <div className={styles["calendar-container"]}>
                        <table className={styles["calendar"]}>
                            <thead>
                                <tr className={styles["day-of-the-week"]}>
                                    <th>Sun</th>
                                    <th>Mon</th>
                                    <th>Tue</th>
                                    <th>Wed</th>
                                    <th>Thu</th>
                                    <th>Fri</th>
                                    <th>Sat</th>
                                </tr>
                            </thead>
                            <tbody>
                                {renderCalendar(month, year)}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className={styles["footer-buttons"]}>
                    <button 
                        onClick={() => {
                            const today = new Date()
                            
                            setMonth(today.getMonth() + 1)
                            setYear(today.getUTCFullYear())
                            setDate(today.getDate())

                            setDateValue(today.getDate(), today.getMonth() + 1, today.getUTCFullYear())
                        }}
                    >
                        Today
                    </button>  
                    <button 
                        onClick={() => {
                            setDate(-1)
                        }}
                    >
                        Clear
                    </button>
                </div>
            </div>
        </>
    )
})

export default DatePickerWidget
