import {INFO, WARNING, ERROR} from './constants'

export type SeverityLevel = (typeof INFO) | (typeof WARNING) | (typeof ERROR)

export interface IndicatorProps {
    state: IndicatorState,
    className?: string,
    onClose?: () => void,
}

export interface IndicatorState {
    type: SeverityLevel,
    show: boolean,
    message?: string
}
