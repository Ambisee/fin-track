"use client"

import PublicHeader from "@/components/PublicHeader/PublicHeader"

interface PublicLayoutProps {
    children: React.ReactNode
}

export default function PublicLayout({
    children
}: PublicLayoutProps) {
  return (
    <>
        <PublicHeader />
        {children}
    </>
  )
}
