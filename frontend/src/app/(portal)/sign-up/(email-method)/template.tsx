"use client"

import { motion, Variant } from "framer-motion"
import { usePathname } from "next/navigation"
import { useContext, useEffect, useState } from "react"
// import { EmailSignupPaths, pageIndexMap, PageTransitionContext } from "./layout"
import TransitionPage from "@/components/user/Transition/TransitionPage"

interface SignUpTemplateProps {
	children: JSX.Element
}

export default function SignUpTemplate(props: SignUpTemplateProps) {
	return <TransitionPage>{props.children}</TransitionPage>
}
