"use client"

import { ReactNode, createContext, useState, useContext, Dispatch, SetStateAction } from "react"

interface ProtectedLayoutContextObject {
    isNavToggled: boolean,
    isDropdownToggled: boolean,
    isEntryFormToggled: boolean,
    setIsDropdownToggled: Dispatch<SetStateAction<boolean>>,
    setIsNavToggled: Dispatch<SetStateAction<boolean>>,
    setIsEntryFormToggled: Dispatch<SetStateAction<boolean>>
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

    return {
        isNavToggled,
        isDropdownToggled,
        isEntryFormToggled,
        setIsDropdownToggled,
        setIsNavToggled,
        setIsEntryFormToggled
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