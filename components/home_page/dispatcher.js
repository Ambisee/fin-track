// Reducer values
const defaultValues = {
    curentIndex: 0,
    showMessage: false,
    type: undefined,
    message: "",
}

// Reducer handlers
const handlers = {}

const SHOW_MESSAGE = 'SHOW_MESSAGE'
const UNSHOW_MESSAGE = 'UNSHOW_MESSAGE'
const GO_TO_LOGIN = 'GO_TO_LOGIN'
const GO_TO_REGISTRATION = 'GO_TO_REGISTRATION'
const GO_TO_FORGOT_PASSWORD = 'GO_TO_FORGOT_PASSWORD'

const indexDirectory = {
    LOGIN: 0,
    REGISTRATION: 1,
    FORGOT_PASSWORD: 2,
}

handlers.GO_TO_LOGIN = (state, action) => ({...state, currentIndex: 0})
handlers.GO_TO_REGISTRATION = (state, action) => ({...state, currentIndex: 1})
handlers.GO_TO_FORGOT_PASSWORD = (state, action) => ({...state, currentIndex: 2})
handlers.UNSHOW_MESSAGE = (state, action) => ({...state, showMessage: false, type: undefined})
handlers.SHOW_MESSAGE = (state, action) => ({
    ...state,
    showMessage: true, 
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
    SHOW_MESSAGE,
    UNSHOW_MESSAGE,
    GO_TO_FORGOT_PASSWORD, 
    GO_TO_REGISTRATION, 
    GO_TO_LOGIN
}