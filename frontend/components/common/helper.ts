import { Dispatch } from "react"

import { TOGGLE_MESSAGE } from "./constants"
import { IndicatorState, SeverityLevel } from "./MessageIndicator/types"
import { INFO } from "./MessageIndicator/constants"

/**
 * Utility function to display a message for a period of time
 * on the home page
 * 
 * @param dispatch the dispatch function that manipulates the state of the
 *      message indicator
 * @param message the message to be displayed
 * @param type the severity type of the message to be displayed
 * @param time the amount of time the image will be displayed for in milliseconds 
 */
function flashMessage(
    dispatch: Dispatch<{type: typeof TOGGLE_MESSAGE, payload: IndicatorState, [key: string]: any}>, 
    message: string, 
    type: SeverityLevel, 
    time: number = 0
) {
    dispatch({ type: TOGGLE_MESSAGE, payload: { message: message, show: true, type: type } })
    dispatch({ type: TOGGLE_MESSAGE, payload: { message: message, show: true, type: type } })
    
    if (time != 0) {
        setTimeout(() => {
            dispatch({ type: TOGGLE_MESSAGE, payload: { type: type, message: message, show: false } })
        }, time)
    }
}

export { 
    flashMessage
}
