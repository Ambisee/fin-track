import { ReactNode } from "react"

import ProtectedNavbar from "@/components/ProtectedNavbar/ProtectedNavbar"
import ProtectedLayout from "@/components/ProtectedLayout/ProtectedLayout"

interface DashboardLayoutProps {
    children: ReactNode
}

export default function DashboardLayout(props: DashboardLayoutProps) {
    return (
        <ProtectedLayout>
            {props.children}
        </ProtectedLayout>
    )
}