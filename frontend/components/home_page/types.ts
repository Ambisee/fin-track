import { TOGGLE_MESSAGE } from "../common/constants";
import { IndicatorState } from "../common/MessageIndicator/types";
import { GO_TO_LOGIN, GO_TO_FORGOT_PASSWORD, GO_TO_REGISTRATION } from "./constants";

export type HomeDispatchType = 
    (typeof TOGGLE_MESSAGE) |
    (typeof GO_TO_LOGIN) |
    (typeof GO_TO_FORGOT_PASSWORD) |
    (typeof GO_TO_REGISTRATION)

export interface HomeDispatcherArgs {
    type: HomeDispatchType,
    payload?: IndicatorState
}

export interface HomeStateCollection { 
    currentIndex: number, 
    indicatorState: IndicatorState
}
