import { createContext, useContext } from "react"
import { createTransitionRoot, TransitionContextObject } from "./TransitionRoot"
import { createTransitionLink } from "./TransitionLink"
import { createTransitionPage } from "./TransitionPage"

export class TransitionFactory {
	public static createTransitionComponents = () => {
		const context = createContext<TransitionContextObject>(null!)
		const TransitionRoot = createTransitionRoot(context)
		const TransitionPage = createTransitionPage(context)
		const TransitionLink = createTransitionLink(context)

		const useTransitionContext = () => useContext(context)

		return {
			useTransitionContext,
			TransitionRoot,
			TransitionPage,
			TransitionLink
		}
	}
}
