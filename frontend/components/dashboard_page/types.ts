import { HOVER, REDIRECT, TOGGLE_DROPDOWN, TOGGLE_MESSAGE, TOGGLE_SIDEBAR } from "./dispatcher"

type DispatchTypes = 
    typeof HOVER    |
    typeof REDIRECT |
    typeof TOGGLE_DROPDOWN |
    typeof TOGGLE_MESSAGE |
    typeof TOGGLE_SIDEBAR

interface NavDispatchObject {
    type: DispatchTypes,
    action: {
        value?: number | boolean,
        payload?: {
            type: string, // TODO : Change to IndicatorStatus later on
            showMessage: boolean,
            message: string,
        } 
    }
}

export interface NavContextObject {
    navState: object,
    navDispatch: (arg0: NavDispatchObject) => void
}