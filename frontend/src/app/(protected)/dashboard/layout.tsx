"use client"

import ProtectedNavbar from "@/components/user/ProtectedNavbar"

interface DashboardLayoutProps {
	children: JSX.Element
}

export default function DashboardLayout(props: DashboardLayoutProps) {
	return (
		<div>
			<div
				className="dashboard-content bg-background overflow-y-auto h-screen"
				vaul-drawer-wrapper=""
			>
				{props.children}
			</div>
			<ProtectedNavbar />
		</div>
	)
}
