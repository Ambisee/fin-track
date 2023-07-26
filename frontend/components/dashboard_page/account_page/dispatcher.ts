import { 
    AccountDispatchType,
    AccountDispatchArgs,
    AccountStateCollection
} from "./types"

const dataReducerHandlers: {[key in AccountDispatchType]: (state: AccountStateCollection, action: AccountDispatchArgs) => any} = {
    SET_EMAIL: (state, action) => ({}),
    SET_ALLOW_EMAIL_REPORT: (state, action) => ({}),
    SET_DISPLAY_NAME: (state, action) => ({}),
}

dataReducerHandlers.SET_EMAIL = (state, action) => ({...state, email: action.value})
dataReducerHandlers.SET_DISPLAY_NAME = (state, action) => ({...state, displayName: action.value})
dataReducerHandlers.SET_ALLOW_EMAIL_REPORT = (state, action) => ({...state, canSendReport: action.value})

function reducer(state, action) {
    const handler = dataReducerHandlers[action.type]
    
    if (handler == undefined) {
        return state
    }
    
    return handler(state, action)
}

export {
    reducer
}