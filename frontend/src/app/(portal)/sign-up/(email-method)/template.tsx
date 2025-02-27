"use client"

import { SignupTransitionPage } from "./layout"

interface SignUpTemplateProps {
	children: JSX.Element
}

export default function SignUpTemplate(props: SignUpTemplateProps) {
	return <SignupTransitionPage>{props.children}</SignupTransitionPage>
}
