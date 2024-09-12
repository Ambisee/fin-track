"use client"

import { motion, Variant } from "framer-motion"
import { usePathname } from "next/navigation"
import { useContext, useEffect, useState } from "react"
import { EmailSignupPaths, pageIndexMap, PageTransitionContext } from "./layout"

interface SignUpTemplateProps {
	children: JSX.Element
}

const variants: { [key: string]: Variant } = {
	outsideRight: { x: 100, opacity: 0 },
	inside: { x: 0, opacity: 1 },
	outsideLeft: { x: -100, opacity: 0 }
}

export default function SignUpTemplate(props: SignUpTemplateProps) {
	const pathname = usePathname()
	const { prevPage, setPrevPage } = useContext(PageTransitionContext)
	const [initial, setInitial] = useState<string | boolean>(() => {
		let initial
		let pageIndex = pageIndexMap.get(pathname as EmailSignupPaths) as number
		if (prevPage === pageIndex || prevPage === -1) {
			initial = false
		} else if (prevPage < pageIndex) {
			initial = "outsideRight"
		} else {
			initial = "outsideLeft"
		}

		return initial
	})

	useEffect(() => {
		let pageIndex = pageIndexMap.get(pathname as EmailSignupPaths) as number
		setPrevPage(pageIndex)
	}, [pathname, setPrevPage])

	return (
		<motion.div
			layout
			className="w-full h-full"
			key={pathname}
			variants={variants}
			initial={initial}
			animate="inside"
			transition={{ type: "tween", duration: 0.25 }}
		>
			{props.children}
		</motion.div>
	)
}
