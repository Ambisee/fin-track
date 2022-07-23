/**
 * components/dashboard_page/dispatcher.js
 * 
 * Defines the reducer that will be used to keep
 * track of the dashboard layout's side bar links
 */
import { useReducer } from "react"


/**
 * handlers: Object =
 *      The Object that maps each `type` to a handler function
 * 
 *      - HOVER = set the currently hovered link index
 *      - REDIRECT = set the current page index
 */
const handlers = {}

const HOVER = 'HOVER'
const REDIRECT = 'REDIRECT'

handlers.HOVER = (state, action) => ({...state, hoverIndex: action.index})
handlers.REDIRECT = (state, action) => ({...state, currentPage: action.index})

function reducer(state, action) {
    const handler = handlers[action.type]
    if (handler != undefined) {
        return handler(state, action)
    }
    return state
}

function usePageTracker(pageIndex = 0) {
    /**
     * currentPage: Number =
     *      The link index of the current page
     * hoverIndex: Number =
     *      The link index of the currently hovered link
     */
    const defaultValues = {
        currentPage: pageIndex,
        hoverIndex: pageIndex
    }

    const [state, dispatch] = useReducer(reducer, defaultValues)
    return [state, dispatch]
}

export {
    HOVER,
    REDIRECT,
    usePageTracker
}