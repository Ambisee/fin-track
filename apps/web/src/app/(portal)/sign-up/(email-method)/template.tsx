"use client"

import { ReactNode } from "react"
import { SignupTransitionPage } from "./layout"

interface SignUpTemplateProps {
	children: ReactNode
}

export default function SignUpTemplate(props: SignUpTemplateProps) {
	return <SignupTransitionPage>{props.children}</SignupTransitionPage>
}
