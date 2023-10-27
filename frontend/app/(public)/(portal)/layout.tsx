import { ReactNode } from "react"

import PortalLoaderProvider from "@/components/PortalLoaderProvider/PortalLoaderProvider"
import PortalLoadingIndicator from "@/components/PortalLoadingIndiciator/PortalLoadingIndicator"

interface PortalLayoutProps {
    children: ReactNode
}

export default function PortalLayout(props: PortalLayoutProps) {
    return (
        <PortalLoaderProvider>
            {props.children}
            <PortalLoadingIndicator />
        </PortalLoaderProvider>
    )
}