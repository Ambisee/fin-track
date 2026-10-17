import { ReloadIcon } from "@radix-ui/react-icons"

export default function Loading() {
	return (
		<div className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]">
			<ReloadIcon className="h-4 w-4 relative animate-spin" />
		</div>
	)
}
