/**
 * Defines the reducer that will be used to keep
 * track of the dashboard layout's side bar links
 */
import { Dispatch, useReducer } from "react"

import { HOVER, REDIRECT, TOGGLE_DROPDOWN, TOGGLE_SIDEBAR } from "./constants"
import { NavDispatcherArgs, NavDispatchTypes, NavStateCollection } from './types'
import { INFO } from "../common/MessageIndicator/constants"


/**
 * currentPage: Number =
 *      The link index of the current page
 * hoverIndex: Number =
 *      The link index of the currently hovered link
 * isDropdownToggled: Boolean =
 *      Indicates whether or not the dropdown menu is toggled or not
 * isSideBarToggled: Boolean =
 *      Indicates whether or not the side navigation bar 
 *      is toggled or not in mobile viewports
 * isLoading: Boolean =
 *      Indicates whether the page is loading
 * messageIndicator: Object =
 *      Object storing values used by the messageIndicator component
 */
const defaultValues: NavStateCollection = {
    currentPage: 0,
    hoverIndex: 0,
    isDropdownToggled: false,
    isSideBarToggled: false,
    indicatorState: {
        type: INFO,
        show: false,
        message: ""
    }
}

/**
 * handlers: Object =
 *      The Object that maps each `type` to a handler function
 * 
 *      - HOVER = set the currently hovered link index
 *      - REDIRECT = set the current page index
 *      - TOGGLE_DROPDOWN = toggle the top nav bar's dropdown menu
 *      - TOGGLE_SIDEBAR = toggle the side nav bar in mobile view
 *      - TOGGLE_LOADING = toggle loading state of the dashboard page
 */
const handlers: {[key in NavDispatchTypes]: (state: any, action: any) => any} = {} as any

handlers.HOVER = (state, action) => ({...state, hoverIndex: action.value})
handlers.REDIRECT = (state, action) => ({...state, currentPage: action.value})
handlers.TOGGLE_DROPDOWN = (state, action) => ({...state, isDropdownToggled: action.value})
handlers.TOGGLE_SIDEBAR = (state, action) => ({...state, isSideBarToggled: action.value})
handlers.TOGGLE_MESSAGE = (state, action) => ({
    ...state,
    indicatorState: {
        type: action?.payload?.type,
        show: action?.payload?.show,
        message: action?.payload?.message,
    }
})

function reducer(state, action) {
    const handler = handlers[action.type]
    if (handler != undefined) {
        return handler(state, action)
    }
    return state
}

/**
 * 
 * @param {Number} pageIndex
 *      The initial page's index number
 * @returns 
 */
function useNavReducer(pageIndex = 0): [NavStateCollection, Dispatch<NavDispatcherArgs>] {
    defaultValues.currentPage = pageIndex
    defaultValues.hoverIndex = pageIndex

    const [state, dispatch] = useReducer(reducer, defaultValues)
    return [state, dispatch]
}



export {
    useNavReducer
}