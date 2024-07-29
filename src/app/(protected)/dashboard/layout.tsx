"use client"

import ProtectedNavbar from "@/components/user/ProtectedNavbar"
import { sbBrowser } from "@/lib/supabase"
import { useQuery } from "@tanstack/react-query"

interface DashboardLayoutProps {
	children: JSX.Element
}

export default function DashboardLayout(props: DashboardLayoutProps) {
	return (
		<>
			<div className="pb-4" vaul-drawer-wrapper="">
				{props.children}
			</div>
			<ProtectedNavbar />
		</>
	)
}
