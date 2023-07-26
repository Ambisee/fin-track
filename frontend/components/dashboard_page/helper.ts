import { Dispatch } from "react"

import { NavDispatcherArgs } from "./types"
import { flashMessage } from "../common/helper"
import { Money } from "../../firebase/firestoreClasses"
import { ERROR } from '../../components/common/MessageIndicator/constants'

function validateData(
    dispatch: Dispatch<NavDispatcherArgs>, 
    amount: string, 
    detail: string, 
    date: string
) : [Date, string, Money] {
    // Check if the amount is valid
    if (!Money.isValidAmount(amount)) {
        flashMessage(dispatch, 'Please enter a valid amount.', ERROR, 2000)
        return [undefined, undefined, undefined]
    }

    // Convert the date string into a Date object
    const re1 = new RegExp(/\d{4}-\d{2}-\d{2}/)
    const re2 = new RegExp(/\d{4}\/\d{2}\/\d{2}/)

    if (!re1.test(date) && !re2.test(date)) {
        flashMessage(dispatch, "Please enter a date in a 'yyyy/mm/dd' format", ERROR, 2000)
        return [undefined, undefined, undefined]
    }

    // Check if the given date is valid
    let d: Date = new Date(date)
    if (isNaN(d.getDate())) {
        flashMessage(dispatch, 'Please enter a valid date.', ERROR, 2000)
        return [undefined, undefined, undefined]
    }

    let dateString = date
    if (re1.test(date)) {
        dateString = date.split('-').join('/')
    }

    d = new Date(dateString)

    // Convert the amount to a Money object
    const money = new Money(amount)

    return [d, detail, money]
}

export {
    validateData
}