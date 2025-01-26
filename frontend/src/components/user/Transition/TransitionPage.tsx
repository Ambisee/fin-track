"use client"

import { DEFAULT_LABEL, TRANSITION_PAGE_CLASSNAME } from "@/lib/constants"
import { usePathname } from "next/navigation"
import { HTMLProps, useEffect } from "react"
import { useTransitionContext } from "./TransitionRoot"

export default function TransitionPage(props: HTMLProps<HTMLDivElement>) {
	const pathname = usePathname()
	const { isExiting, curLabel, transitionLabels } = useTransitionContext()

	useEffect(() => {
		if (isExiting) {
			return
		}

		const pageComponent = document.querySelector(
			`.${TRANSITION_PAGE_CLASSNAME}`
		)
		if (!pageComponent) {
			return
		}

		if (curLabel === DEFAULT_LABEL) {
			pageComponent.classList.remove("opacity-0")
			pageComponent.classList.remove("pointer-events-none")
			return
		}

		const animationClassName = transitionLabels?.[curLabel]?.enter
		if (animationClassName === undefined) {
			pageComponent.classList.remove("opacity-0")
			pageComponent.classList.remove("pointer-events-none")
			return
		}

		const animationFinishCallback = () => {
			pageComponent.classList.remove("pointer-events-none")
			if (pageComponent.classList.contains(animationClassName)) {
				pageComponent.classList.remove(animationClassName)
			}
		}

		pageComponent.classList.remove("opacity-0")
		pageComponent.classList.add(animationClassName)

		pageComponent.addEventListener("animationend", animationFinishCallback)

		return () => {
			pageComponent.removeEventListener("animationend", animationFinishCallback)
		}
	}, [isExiting, curLabel, transitionLabels])

	return (
		<div
			className={`relative opacity-0 pointer-events-none ${TRANSITION_PAGE_CLASSNAME}`}
		>
			{props.children}
		</div>
	)
}
