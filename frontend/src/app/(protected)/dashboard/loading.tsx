import { ReloadIcon } from "@radix-ui/react-icons"

export default function Loading() {
	return (
		<div className="w-full h-full flex justify-center items-center">
			<ReloadIcon className="h-4 w-4 animate-spin" />
		</div>
	)
}
