"use client"

import { Button } from "@/components/ui/button"
import {
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog"
import { useIsSafari } from "@/lib/hooks"
import { isNonNullable } from "@/lib/utils"
import { ReloadIcon } from "@radix-ui/react-icons"
import {
	DocumentProps,
	PDFDownloadLink,
	PDFViewer,
	usePDF
} from "@react-pdf/renderer"
import { useQuery } from "@tanstack/react-query"
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
	const { isSafari, isLoading: isBrowserChecking } = useIsSafari()

	const blobUrlQuery = useQuery({
		queryKey: [instance, isSafari] as const,
		queryFn: async ({ queryKey }) => {
			const rawBlob = queryKey[0].blob
			if (!isNonNullable(rawBlob)) return rawBlob

			const isBrowserSafari = queryKey[1]
			const streamBlob = new Blob([rawBlob], {
				type: isBrowserSafari ? "application/octet-stream" : "application/pdf"
			})

			return URL.createObjectURL(streamBlob)
		},
		enabled: !isBrowserChecking
	})

	useEffect(() => {
		update(props.children)
	}, [props.children])

	useEffect(() => {
		return () => {
			if (!isNonNullable(blobUrlQuery.data)) return
			URL.revokeObjectURL(blobUrlQuery.data)
		}
	}, [blobUrlQuery.data])

	return (
		<DialogContent
			hideCloseButton
			className="p-0 flex flex-col h-dvh w-dvw duration-0 border-0 sm:border sm:max-w-4xl sm:w-[95vw] sm:h-[90vh] overflow-hidden"
		>
			<DialogHeader className="pt-4 px-4 flex flex-row items-center">
				<DialogTitle asChild>
					<h2 className="mx-auto sm:w-full leading-6">
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
				<PDFViewer
					className="flex-1 w-full border-0 p-0"
					// title="PDF preview"
				>
					{props.children}
				</PDFViewer>
			)}
			<DialogFooter className="gap-2 px-4 pb-4">
				<Button
					variant="outline"
					disabled={blobUrlQuery.isLoading || blobUrlQuery.isFetching}
					className="aria-disabled:opacity-50 aria-disabled:pointer-events-none"
					asChild
				>
					<a
						href={blobUrlQuery.data ?? undefined}
						aria-disabled={instance.loading}
						download={`${props.title ?? "FinTrack Report"}.pdf`}
						onClick={(e) => instance.loading && e.preventDefault()}
					>
						{instance.loading ? (
							<ReloadIcon className="size-4 animate-spin" />
						) : (
							<>
								Download
								<DownloadIcon />
							</>
						)}
					</a>
				</Button>
				<Button asChild>
					<a
						href={instance.url ?? undefined}
						target="_blank"
						rel="noopener noreferrer"
					>
						New Tab
						<ArrowUpRightIcon />
					</a>
				</Button>
			</DialogFooter>
		</DialogContent>
	)
}
