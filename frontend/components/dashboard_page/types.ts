import { TOGGLE_MESSAGE } from "../common/constants"

import { HOVER, REDIRECT, TOGGLE_DROPDOWN, TOGGLE_SIDEBAR } from "./constants"
import { IndicatorState } from "../common/MessageIndicator/types"

export type NavDispatchTypes = 
    typeof HOVER |
    typeof REDIRECT |
    typeof TOGGLE_DROPDOWN |
    typeof TOGGLE_MESSAGE |
    typeof TOGGLE_SIDEBAR

export interface NavStateCollection {
    currentPage: number,
    hoverIndex: number,
    isDropdownToggled: boolean,
    isSideBarToggled: boolean,
    indicatorState: IndicatorState
}

export interface NavDispatcherArgs {
    type: NavDispatchTypes,
    value?: number | boolean,
    payload?: IndicatorState
}
