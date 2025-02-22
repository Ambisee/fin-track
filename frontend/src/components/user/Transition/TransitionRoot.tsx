"use client"

import {
	DEFAULT_LABEL,
	TRANSITION_PAGE_CLASSNAME,
	TRANSITION_ROOT_CLASSNAME
} from "@/lib/constants"
import { NavigationEdges, TransitionClassNames } from "@/types/transition"
import { usePathname, useRouter } from "next/navigation"
import {
	createContext,
	HTMLProps,
	useContext,
	useEffect,
	useRef,
	useState
} from "react"

export interface TransitionContextObject {
	curLabel: string
	isExiting: boolean
	navigateTo: (path: string) => void
	transitionLabels: {
		[label: string]: TransitionClassNames
	}
}

export interface TransitionRootProps extends HTMLProps<HTMLDivElement> {
	/**
	 * A callback function to render the new page, referenced by `nextPath`
	 *
	 * This function should cause the current `TransitionPage` component to
	 * unmount and render a new `TransitionPage` component referenced by `nextPath`
	 */
	onNavigate: (nextPath: string) => void

	/**
	 *
	 */
	navigationGraph: {
		[path: string]: NavigationEdges
	}

	transitionLabels: {
		[label: string]: TransitionClassNames
	}
}

const TransitionContext = createContext<TransitionContextObject>(null!)

export function useTransitionContext() {
	const context = useContext(TransitionContext)
	if (!context) {
		throw Error("Transition context should be called from a TransitionRoot")
	}

	return context
}

export function TransitionRoot(props: TransitionRootProps) {
	const { navigationGraph, transitionLabels, className, ...elementProps } =
		props

	const [isExiting, setIsExiting] = useState<boolean>(false)
	const [curPath, setCurPath] = useState<string>("")
	const [curLabel, setCurLabel] = useState<string>(DEFAULT_LABEL)

	const navigationGraphRef = useRef(navigationGraph)
	const transitionLabelRef = useRef(transitionLabels)

	const pathname = usePathname()
	const router = useRouter()

	useEffect(() => {
		if (curPath === "") {
			setCurPath(pathname)
		}
	}, [pathname, curPath, setCurPath])

	const navigateTo = (nextPath: string) => {
		// Retrieve the label for the redirection
		const label = navigationGraphRef.current?.[curPath]?.[nextPath]
		setIsExiting(true)
		setCurLabel(label ?? DEFAULT_LABEL)

		// Set the new current path
		setCurPath(nextPath)

		// Apply the animation
		if (label === undefined) {
			setIsExiting(false)
			router.push(nextPath)
			return
		}

		const animationClassName = transitionLabelRef.current?.[label]?.exit
		if (animationClassName === undefined) {
			setIsExiting(false)
			router.push(nextPath)
			return
		}

		const pageComponent = document.querySelector(
			`.${TRANSITION_PAGE_CLASSNAME}`
		)
		pageComponent?.classList.add("pointer-events-none")

		if (!pageComponent) {
			setIsExiting(false)
			router.push(nextPath)
			return
		}

		// Animate the page component and redirect after animation end
		pageComponent.classList.add(animationClassName)
		pageComponent.addEventListener("animationend", () => {
			setIsExiting(false)
			router.push(nextPath)
		})
	}

	return (
		<TransitionContext.Provider
			value={{
				curLabel,
				isExiting,
				transitionLabels: transitionLabelRef.current,
				navigateTo
			}}
		>
			<div
				className={`${TRANSITION_ROOT_CLASSNAME} ${className}`}
				{...elementProps}
			></div>
		</TransitionContext.Provider>
	)
}
