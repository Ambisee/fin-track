"use client"

import { useContext, createContext, ReactNode, useState, SetStateAction, Dispatch } from "react"

interface PortalLoaderContextObject {
    isLoading: boolean,
    setIsLoading: Dispatch<SetStateAction<boolean>>
}

interface PortalLoaderProviderProps {
    children: ReactNode
}

const PortalLoaderContext = createContext<PortalLoaderContextObject>({} as PortalLoaderContextObject)

export default function PortalLoaderProvider(props: PortalLoaderProviderProps) {
    const [isLoading, setIsLoading] = useState(false)
    
    return (
        <PortalLoaderContext.Provider value={{isLoading, setIsLoading}}>
            {props.children}
        </PortalLoaderContext.Provider>
    )
}

export { PortalLoaderContext }