"use client"

import Link from "next/link"
import { ComponentProps } from "react"
import { useTransitionContext } from "./TransitionRoot"

type TransitionLinkProps = ComponentProps<typeof Link>

export default function TransitionLink(props: TransitionLinkProps) {
	const { href, onClick, ...restProps } = props
	const { navigateTo } = useTransitionContext()

	return (
		<Link
			href={href}
			onClick={(e) => {
				e.preventDefault()
				onClick?.(e)
				navigateTo(href.toString())
			}}
			{...restProps}
		/>
	)
}
