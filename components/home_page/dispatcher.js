/**
 * Defines the reducer that will keep track
 * of the forms' states
 */

/**
 * currentIndex: Integer =
 *      an integer indicating the form that is
 *      currently being displayed
 * showMessage: Boolean =
 *      a boolean value indicating whether a message 
 *      is currently being shown
 * type: String =
 *      the `type` of message that is being shown
 * message: String =
 *      the content of the message that is being shown
 */
const defaultValues = {
    curentIndex: 0,
    showMessage: false,
    type: undefined,
    message: "",
}

/**
 * handlers: Object =
 *      the object that maps each action handler to a `type` of action
 *      
 *      - SHOW_MESSAGE = display a message to the user
 *      - UNSHOW_MESSAGE = unshow a displayed message to the user
 *      - GO_TO_LOGIN = display the `Login` form
 *      - GO_TO_REGISTRATION = display the `Registration` form
 *      - GO_TO_FORGOT_PASSWORD = display the `ForgotPassword` form
 */
const handlers = {}

const TOGGLE_MESSAGE = 'TOGGLE_MESSAGE'
const GO_TO_LOGIN = 'GO_TO_LOGIN'
const GO_TO_REGISTRATION = 'GO_TO_REGISTRATION'
const GO_TO_FORGOT_PASSWORD = 'GO_TO_FORGOT_PASSWORD'

// An Object that maps each form to an index
const indexDirectory = {
    LOGIN: 0,
    REGISTRATION: 1,
    FORGOT_PASSWORD: 2,
}

handlers.GO_TO_LOGIN = (state, action) => ({...state, currentIndex: 0})
handlers.GO_TO_REGISTRATION = (state, action) => ({...state, currentIndex: 1})
handlers.GO_TO_FORGOT_PASSWORD = (state, action) => ({...state, currentIndex: 2})
handlers.TOGGLE_MESSAGE = (state, action) => ({
    ...state,
    showMessage: action?.payload?.showMessage, 
    message: action?.payload?.message, 
    type: action?.payload?.type
})

function reducer(state, action) {
    const handler = handlers[action.type]
    if (handler !== undefined) {
        return handler(state, action)
    }
    return state
}

export {
    reducer, 
    defaultValues, 
    indexDirectory,
    TOGGLE_MESSAGE,
    GO_TO_FORGOT_PASSWORD, 
    GO_TO_REGISTRATION, 
    GO_TO_LOGIN
}