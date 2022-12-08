import { INFO, ERROR, WARNING } from "./MessageIndicator"

export type IndicatorStatus =
    typeof INFO |
    typeof ERROR |
    typeof WARNING

export interface IndicatorState {
    type: IndicatorStatus,
    message?: string
}