"use client"

import { motion, Variant } from "framer-motion"
import { usePathname } from "next/navigation"
import { useContext, useEffect } from "react"
import { PageTransitionContext } from "./layout"

interface SignUpTemplateProps {
	children: JSX.Element
}

const pageIdMap = new Map<string, number>([
    ['/sign-up/email', 0],
    ['/sign-up/username', 1],
    ['/sign-up/password', 2]
])

const variants: {[key: string]: Variant } = {
	outsideRight: { x: 100, opacity: 0, transition: {duration: 0.25} },
	inside: { x: 0, opacity: 1, transition: {duration: 0.25} },
	outsideLeft: { x: -100, opacity: 0, transition: {duration: 0.25} }
}

export default function SignUpTemplate(props: SignUpTemplateProps) {
	const pathname = usePathname()
    const { prevPage, setPrevPage } = useContext(PageTransitionContext)

    let curPage = pageIdMap.get(pathname)
    let initial = "outsideRight"

    if (curPage !== undefined && curPage < prevPage) {
        initial = "outsideLeft"
    }

    useEffect(() => {
        if (curPage !== undefined) {
            setPrevPage(curPage)
        }
        
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
		<motion.div
            key={pathname}
			variants={variants}
			initial={initial}
			animate="inside"
			exit="outsideLeft"
            transition={{type: "inertia"}}
		>
			{props.children}
		</motion.div>
	)
}
