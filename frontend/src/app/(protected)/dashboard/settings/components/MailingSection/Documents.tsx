import { Label } from "@/components/ui/label"
import { useContext } from "react"
import { DashboardContext } from "../../../layout"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { DownloadIcon } from "@radix-ui/react-icons"

export default function Documents() {
	const { dataGroups } = useContext(DashboardContext)

	const renderDownloadList = () => {
		const result = []

		for (let i = dataGroups.length - 1; i >= 0; i--) {
			const value = dataGroups[i]

			result.push(
				<li className="px-1" key={`${value.month} ${value.year}`}>
					<Button
						onClick={() => {
							// TODO: Implement download report functionalities
						}}
						className="p-4 w-full h-full flex justify-between"
						variant="ghost"
					>
						<span>
							{value.month} {value.year}
						</span>
						<DownloadIcon />
					</Button>
				</li>
			)
		}

		return result
	}

	return (
		<Dialog>
			<div className="mt-8">
				<div>
					<Label>Documents</Label>
					<p className="text-sm text-muted-foreground">
						Download a PDF document detailing the transactions of a given month.
					</p>
				</div>
				<DialogTrigger asChild>
					<Button className="mt-4">Download a report</Button>
				</DialogTrigger>
			</div>
			<DialogContent
				hideCloseButton
				className=" h-dvh max-w-none duration-0 border-0 sm:border sm:h-5/6 sm:min-h-[460px] sm:max-w-lg"
			>
				<DialogHeader>
					<div className="relative space-y-0 sm:text-center">
						<DialogTitle className="leading-6" asChild>
							<h1 className="h-6 leading-6">
								Select a month to download a report PDF
							</h1>
						</DialogTitle>
						<DialogClose className="absolute block right-0 top-1/2 translate-y-[-50%]">
							<X className="w-4 h-4" />
						</DialogClose>
					</div>
					<DialogDescription>
						<VisuallyHidden>
							Select a month to download the report PDF for that month
						</VisuallyHidden>
					</DialogDescription>
				</DialogHeader>
				<ul className="overflow-y-auto grid gap-1.5">{renderDownloadList()}</ul>
			</DialogContent>
		</Dialog>
	)
}
