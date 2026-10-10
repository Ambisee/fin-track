"use client"

import {
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog"
import { DocumentProps, usePDF } from "@react-pdf/renderer"
import { X } from "lucide-react"
import { ReactElement, useEffect } from "react"

interface TransactionReportViewerProps {
	children: ReactElement<DocumentProps>
}

export default function TransactionReportViewer(
	props: TransactionReportViewerProps
) {
	const [instance, update] = usePDF({ document: props.children })

	useEffect(() => {
		update(props.children)
	}, [props.children])

	return (
		<DialogContent
			hideCloseButton
			className="p-0 flex flex-col h-dvh w-dvw duration-0 border-0 sm:border sm:max-w-4xl sm:w-[95vw] sm:h-[90vh] overflow-hidden"
		>
			<DialogHeader className="pt-4 px-4 flex flex-row justify-between items-center">
				<DialogTitle asChild>
					<h2 className="w-2/3 mx-auto sm:w-full leading-6">PDF Viewer</h2>
				</DialogTitle>
				<DialogClose>
					<X className="w-4 h-4" />
				</DialogClose>
			</DialogHeader>
			<iframe
				src={`${instance.url}#zoom=page-fit&toolbar=1`}
				className="flex-1 w-full border-0 p-0"
				title="PDF preview"
			></iframe>
		</DialogContent>
	)
}
