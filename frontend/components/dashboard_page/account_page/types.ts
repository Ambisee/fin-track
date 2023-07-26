import {
    SET_EMAIL,
    SET_ALLOW_EMAIL_REPORT,
    SET_DISPLAY_NAME
} from './constants'

export type AccountDispatchType = 
    typeof SET_ALLOW_EMAIL_REPORT |
    typeof SET_EMAIL | 
    typeof SET_DISPLAY_NAME

export interface AccountStateCollection {
    email: string,
    displayName: string,
    canSendReport: boolean
}

export interface AccountDispatchArgs {
    type: AccountDispatchType,
    value: string | boolean
}