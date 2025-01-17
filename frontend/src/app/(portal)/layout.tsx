import { Metadata } from "next"
import { ReactElement } from "react"
import PortalLayout from "./sign-up/layout.client"

export const metadata: Metadata = {
	title: "Sign Up - FinTrack"
}

export default function Layout(props: { children: ReactElement }) {
	return <PortalLayout>{props.children}</PortalLayout>
}
