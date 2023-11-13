"use client"

import PublicHeader from "@/components/PublicHeader/PublicHeader"

interface PublicLayoutProps {
    children?: React.ReactNode
}

export default function PublicLayout({
    children
}: PublicLayoutProps) {
  return (
    <div id="inner-body-wrapper">
        <PublicHeader />
        {children}
    </div>
  )
}
