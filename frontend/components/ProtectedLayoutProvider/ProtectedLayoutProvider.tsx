"use client"

import { ReactNode, createContext, useState, useContext, Dispatch, SetStateAction } from "react"

interface ProtectedLayoutContextObject {
    isNavToggled: boolean,
    isDropdownToggled: boolean,
    isEntryFormToggled: boolean,
    isBackdropVisible: boolean,
    backdropToggleCallbacks: (() => void)[],
    setIsDropdownToggled: Dispatch<SetStateAction<boolean>>,
    setIsNavToggled: Dispatch<SetStateAction<boolean>>,
    setIsEntryFormToggled: Dispatch<SetStateAction<boolean>>,
    setIsBackdropVisible: Dispatch<SetStateAction<boolean>>,
    setBackdropToggleCallbacks: Dispatch<SetStateAction<(() => void)[]>>
}

interface ProtectedLayoutProviderProps {
    children?: ReactNode
}

const ProtectedLayoutContext = createContext<ProtectedLayoutContextObject>({} as ProtectedLayoutContextObject)

function useLayout() {
    return useContext(ProtectedLayoutContext)
}

function useLayoutState() {
    const [isNavToggled, setIsNavToggled] = useState(false)
    const [isDropdownToggled, setIsDropdownToggled] = useState(false)
    const [isEntryFormToggled, setIsEntryFormToggled] = useState(false)
    const [isBackdropVisible, setIsBackdropVisible] = useState(false)
    const [backdropToggleCallbacks, setBackdropToggleCallbacks] = useState<(() => void)[]>([])

    return {
        isNavToggled,
        isDropdownToggled,
        isEntryFormToggled,
        isBackdropVisible,
        backdropToggleCallbacks,
        setIsDropdownToggled,
        setIsNavToggled,
        setIsEntryFormToggled,
        setIsBackdropVisible,
        setBackdropToggleCallbacks
    }
}

export default function ProtectedLayoutProvider(props: ProtectedLayoutProviderProps) {
    const layoutState = useLayoutState()
    
    return (
        <ProtectedLayoutContext.Provider value={layoutState}>
            {props.children}
        </ProtectedLayoutContext.Provider>
    )
}

export { useLayout }