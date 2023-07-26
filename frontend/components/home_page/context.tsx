import { createContext, useContext, Dispatch } from "react"

import { HomeDispatcherArgs, HomeStateCollection } from "./types"

export const HomeContext = createContext<{
    state: HomeStateCollection, 
    dispatch: Dispatch<HomeDispatcherArgs>
}>({} as any)

export function useHomeContext() {
    return useContext(HomeContext)
}
