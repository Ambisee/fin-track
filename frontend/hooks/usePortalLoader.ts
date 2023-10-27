import { useContext } from "react"

import { PortalLoaderContext } from "@/components/PortalLoaderProvider/PortalLoaderProvider"

function usePortalLoader() {
    const context = useContext(PortalLoaderContext)
    if (context === undefined) {
        throw new Error("usePortalLoader must be used within a PortalLoaderProvider.")
    }
    return context
}

export default usePortalLoader
