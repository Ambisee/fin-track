import { Metadata } from "next"
import { ReactElement } from "react"
import PortalLayout from "./layout.client"

export const metadata: Metadata = {
	title: "Sign Up - FinTrack"
}

export default function Layout(props: { children: ReactElement<any> }) {
	return <PortalLayout>{props.children}</PortalLayout>
}
