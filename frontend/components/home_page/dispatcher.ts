/**
 * Defines the reducer that will keep track
 * of the forms' states
 */
import { INFO } from "../common/MessageIndicator/constants"
import { HomeDispatchType, HomeDispatcherArgs, HomeStateCollection } from "./types"

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
const defaultValues: HomeStateCollection = {
    currentIndex: 0,
    indicatorState: {
        type: INFO,
        show: false,
        message: "",
    }
}

const handlers: {[key in HomeDispatchType]: (state: HomeStateCollection, action: HomeDispatcherArgs) => any} = {
    TOGGLE_MESSAGE: (state, action) => ({}),
    GO_TO_LOGIN: (state, action) => ({}),
    GO_TO_FORGOT_PASSWORD: (state, action) => ({}),
    GO_TO_REGISTRATION: (state, action) => ({})
}

handlers.GO_TO_LOGIN = (state: HomeStateCollection, action: HomeDispatcherArgs) => ({...state, currentIndex: 0})
handlers.GO_TO_REGISTRATION = (state: HomeStateCollection, action: HomeDispatcherArgs) => ({...state, currentIndex: 1})
handlers.GO_TO_FORGOT_PASSWORD = (state: HomeStateCollection, action: HomeDispatcherArgs) => ({...state, currentIndex: 2})
handlers.TOGGLE_MESSAGE = (state: HomeStateCollection, action: HomeDispatcherArgs) => ({
    ...state,
    indicatorState: {
        type: action.payload.type,
        message: action.payload.message,
        show: action.payload.show
    }
})

function reducer(
    state: HomeStateCollection, 
    action: HomeDispatcherArgs & {[key: string]: any}
): HomeStateCollection {
    const handler = handlers[action.type]
    if (handler !== undefined) {
        return handler(state, action)
    }
    return state
}

export {
    reducer, 
    defaultValues
}