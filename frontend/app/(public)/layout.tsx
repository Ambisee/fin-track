"use client"

import PublicHeader from "@/components/PublicHeader/PublicHeader"

interface PublicLayoutProps {
    children: React.ReactNode
}

const PublicLayout: React.FC<PublicLayoutProps> = ({
    children
}) => {
    return (
        <>
            <PublicHeader />
            {children}
        </>
    )
}

export default PublicLayout
