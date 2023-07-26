import { TOGGLE_MESSAGE } from "../common/constants";
import { IndicatorState } from "../common/MessageIndicator/types";

export interface AwaitVerifyStateCollection {
    indicatorState: IndicatorState
}

export interface AwaitVerifyDispatchArgs {
    type: (typeof TOGGLE_MESSAGE),
    payload: IndicatorState
}