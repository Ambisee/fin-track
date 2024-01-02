import { useState, forwardRef, ChangeEventHandler, DetailedHTMLProps, HTMLProps, Dispatch, SetStateAction, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"

import styles from "./DatePickerWidget.module.css"

interface DatePickerWidgetProps {
    value?: string,
    className?: string,
    onChange: (arg: string) => void,
    setIsVisible?: Dispatch<SetStateAction<boolean>>,
    isVisible?: boolean
}

const DatePickerWidget = forwardRef<HTMLDivElement, DatePickerWidgetProps>(function DatePickerWidget({
    className,
    value,
    onChange,
    setIsVisible=() => {},
    isVisible=true
}, ref) {
    let initialValue = new Date()

    const [date, setDate] = useState(initialValue.getDate())
    const [month, setMonth] = useState(initialValue.getMonth() + 1)
    const [year, setYear] = useState(initialValue.getUTCFullYear())
    const [internalValue, setInternalValue] = useState({year, month, date})

    useEffect(() => {
        if (value === undefined) {
            return
        }

        const date = new Date(value)
        if (isNaN(date.getTime())) {
            setInternalValue(c => ({...c, date: -1}))
            setDate(-1)
            return
        }

        const yyyy = date.getUTCFullYear()
        const mm = date.getUTCMonth() + 1
        const dd = date.getUTCDate()

        console.log(yyyy, mm, dd)
        setDate(dd)
        setMonth(mm)
        setYear(yyyy)
        setInternalValue({year: yyyy, month: mm, date: dd})
    }, [value])

    const setDateValue = (date: number, month: number, year: number) => {
        if (date === -1 || month === -1) {
            setInternalValue(c => ({...c, date: -1}))
            setDate(-1)

            onChange("")
            return
        }
        
        const newValue = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`
        setInternalValue({year, month, date})

        onChange(newValue)
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
                                            val == internalValue.date &&
                                            month == internalValue.month &&
                                            year == internalValue.year
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
        <div 
            ref={ref}
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Escape") {
                    e.stopPropagation()
                    setIsVisible(false)
                }
            }}
            className={`
                ${className}
                ${styles["container"]}
                ${isVisible && styles["visible"]}
            `}
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
                    type="button"
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
                    type="button"
                    onClick={() => {
                        setDateValue(-1, -1, -1)
                    }}
                >
                    Clear
                </button>
            </div>
        </div>
    )
})

export default DatePickerWidget