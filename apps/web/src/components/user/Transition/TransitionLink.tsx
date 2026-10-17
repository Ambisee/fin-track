"use client"

import Link from "next/link"
import { ComponentProps, Context, useContext } from "react"
import { TransitionContextObject } from "./TransitionRoot"

type TransitionLinkProps = ComponentProps<typeof Link>

export const createTransitionLink = (
	context: Context<TransitionContextObject>
) => {
	return function TransitionLink(props: TransitionLinkProps) {
		const { href, onClick, ...restProps } = props
		const { navigateTo } = useContext(context)

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
}
