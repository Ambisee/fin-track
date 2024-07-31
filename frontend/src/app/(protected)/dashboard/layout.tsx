"use client"

import ProtectedNavbar from "@/components/user/ProtectedNavbar"

interface DashboardLayoutProps {
	children: JSX.Element
}

export default function DashboardLayout(props: DashboardLayoutProps) {
	return (
		<>
			<div
				className="p-8 pb-16 min-h-screen md:w-9/12 md:ml-auto"
				vaul-drawer-wrapper=""
			>
				{props.children}
			</div>
			<ProtectedNavbar />
		</>
	)
}
