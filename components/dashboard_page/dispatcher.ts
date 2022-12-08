/**
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
 *      - TOGGLE_DROPDOWN = toggle the top nav bar's dropdown menu
 *      - TOGGLE_SIDEBAR = toggle the side nav bar in mobile view
 *      - TOGGLE_LOADING = toggle loading state of the dashboard page
 */
const handlers: {[key: string]: (state: object, action) => {}} = {}

const HOVER = 'HOVER'
const REDIRECT = 'REDIRECT'
const TOGGLE_DROPDOWN = 'TOGGLE_DROPDOWN'
const TOGGLE_SIDEBAR = 'TOGGLE_SIDEBAR'
const TOGGLE_MESSAGE = 'TOGGLE_MESSAGE'

handlers.HOVER = (state, action) => ({...state, hoverIndex: action.value})
handlers.REDIRECT = (state, action) => ({...state, currentPage: action.value})
handlers.TOGGLE_DROPDOWN = (state, action) => ({...state, isDropdownToggled: action.value})
handlers.TOGGLE_SIDEBAR = (state, action) => ({...state, isSideBarToggled: action.value})
handlers.TOGGLE_MESSAGE = (state, action) => ({
    ...state,
    messageIndicator: {
        type: action?.payload?.type,
        showMessage: action?.payload?.showMessage,
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
function useNavReducer(pageIndex = 0) {
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
    const defaultValues = {
        currentPage: pageIndex,
        hoverIndex: pageIndex,
        isDropdownToggled: false,
        isSideBarToggled: false,
        messageIndicator: {
            type: 'info',
            showMessage: false,
            message: 'hello'
        }
    }

    const [navState, navDispatch] = useReducer(reducer, defaultValues)
    return {navState, navDispatch}
}

export {
    HOVER,
    REDIRECT,
    TOGGLE_DROPDOWN,
    TOGGLE_SIDEBAR,
    TOGGLE_MESSAGE,
    useNavReducer
}