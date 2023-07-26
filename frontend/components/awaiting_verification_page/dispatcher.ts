import { TOGGLE_MESSAGE } from "../common/constants";
import { INFO } from "../common/MessageIndicator/constants";
import { AwaitVerifyDispatchArgs, AwaitVerifyStateCollection } from "./types";

const defaultValues: AwaitVerifyStateCollection = {
    indicatorState: {
        message: "",
        show: false,
        type: INFO
    }
}

const handlers: {
    [key: string]: (
        state: AwaitVerifyStateCollection, 
        action: AwaitVerifyDispatchArgs
    ) => AwaitVerifyStateCollection
} = {} as any

handlers.TOGGLE_MESSAGE = (state, action) => ({...state, indicatorState: action.payload})

function reducer(state: AwaitVerifyStateCollection, action: AwaitVerifyDispatchArgs) {
    const handler = handlers[action.type]
    if (handler === undefined) {
        return state
    }

    return handler(state, action)
}

export {
    reducer,
    defaultValues
}