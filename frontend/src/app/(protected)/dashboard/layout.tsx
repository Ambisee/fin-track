"use client"

import ProtectedNavbar from "@/components/user/ProtectedNavbar"

interface DashboardLayoutProps {
	children: JSX.Element
}

export default function DashboardLayout(props: DashboardLayoutProps) {
	return (
		<>
			<div className="dashboard-content" vaul-drawer-wrapper="">
				{props.children}
			</div>
			<ProtectedNavbar />
		</>
	)
}
