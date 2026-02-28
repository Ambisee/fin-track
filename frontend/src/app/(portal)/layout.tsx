import { Metadata } from "next"
import { ReactNode } from "react"
import PortalLayout from "./layout.client"

export const metadata: Metadata = {
	title: "Sign Up - FinTrack"
}

export default function Layout(props: { children: ReactNode }) {
	return <PortalLayout>{props.children}</PortalLayout>
}
