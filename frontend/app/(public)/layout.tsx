"use client"

import PublicHeader from "@/components/PublicHeader/PublicHeader"

interface PublicLayoutProps {
    children: React.ReactNode
}

const GlobalLayout: React.FC<PublicLayoutProps> = ({
    children
}) => {
    return (
        <>
            <PublicHeader />
            {children}
        </>
    )
}

export default GlobalLayout