import { useToast } from "@/components/ui/use-toast"
import { useEffect } from "react"

export function useCloseToast() {
	const { dismiss } = useToast()

	useEffect(() => {
		dismiss()

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return
}
