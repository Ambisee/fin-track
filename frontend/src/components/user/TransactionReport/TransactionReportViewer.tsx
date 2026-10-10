"use client"

import { Button, buttonVariants } from "@/components/ui/button"
import {
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog"
import { cn, isNonNullable } from "@/lib/utils"
import { ReloadIcon } from "@radix-ui/react-icons"
import { DocumentProps, PDFDownloadLink, usePDF } from "@react-pdf/renderer"
import { ArrowUpRightIcon, DownloadIcon, X } from "lucide-react"
import { ReactElement, useEffect } from "react"

interface TransactionReportViewerProps {
	title?: string
	isLoading?: boolean
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
			<DialogHeader className="pt-4 px-4 flex flex-row items-center">
				<DialogTitle asChild>
					<h2 className="w-2/3 mx-auto sm:w-full leading-6">
						{props.title ?? "PDF Viewer"}
					</h2>
				</DialogTitle>
				<DialogClose>
					<X className="w-4 h-4" />
				</DialogClose>
			</DialogHeader>
			{isNonNullable(props.isLoading) && props.isLoading ? (
				<div className="w-full h-full flex items-center justify-center">
					<ReloadIcon className="h-4 w-4 animate-spin" />
				</div>
			) : (
				<iframe
					src={`${instance.url}#zoom=page-fit&toolbar=1`}
					className="flex-1 w-full border-0 p-0"
					title="PDF preview"
				></iframe>
			)}
			<DialogFooter className="space-y-2 sm:space-y-0 px-4 pb-4">
				<PDFDownloadLink
					className={cn(buttonVariants({ variant: "ghost" }))}
					document={props.children}
					title={`${props.title}.pdf`}
				>
					{(instance) =>
						instance.loading ? (
							<ReloadIcon />
						) : (
							<>
								Download <DownloadIcon />
							</>
						)
					}
				</PDFDownloadLink>
				<Button asChild>
					<a
						href={instance.url ?? undefined}
						target="_blank"
						rel="noopener noreferrer"
					>
						Open
						<ArrowUpRightIcon />
					</a>
				</Button>
			</DialogFooter>
		</DialogContent>
	)
}
