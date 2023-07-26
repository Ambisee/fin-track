import { Dispatch, createContext, useContext } from "react"

import { NavDispatcherArgs, NavStateCollection } from "./types"

export const NavContext = createContext<{
  state: NavStateCollection,
  dispatch: Dispatch<NavDispatcherArgs>
}>({} as any)

export function useDashboardContext() {
  return useContext(NavContext)
}
