"use client"

import { Button } from "@/components/ui/button"
import {
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog"
import {
	Empty,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle
} from "@/components/ui/empty"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from "@/components/ui/table"
import { TRANSACTION_CSV_HEADERS } from "@/lib/constants"
import { useFileDownloadUrlGenerator } from "@/lib/hooks"
import { cn, getTransactionCsvValue } from "@/lib/utils"
import { Entry } from "@/types/Entry"
import { isNonNullable } from "@fintrack/utils"
import { ReloadIcon } from "@radix-ui/react-icons"
import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable
} from "@tanstack/react-table"
import { CircleSlashIcon, DownloadIcon, X } from "lucide-react"
import { useMemo } from "react"

interface TransactionReportViewerProps {
	title?: string
	isLoading?: boolean
	entries: Entry[]
}

const COLUMN_DEFAULT_SIZES: Record<
	(typeof TRANSACTION_CSV_HEADERS)[number],
	number
> = {
	is_positive: 45,
	id: 60,
	currency: 75,
	amount: 100,
	ledger: 120,
	category: 130,
	date: 190,
	note: 250
}

const COLUMN_MIN_SIZES: Record<
	(typeof TRANSACTION_CSV_HEADERS)[number],
	number
> = {
	is_positive: 35,
	id: 40,
	currency: 50,
	amount: 70,
	ledger: 80,
	category: 80,
	date: 120,
	note: 100
}

export default function TransactionCsvDataViewer(
	props: TransactionReportViewerProps
) {
	const { generateCsvDownloadUrl } = useFileDownloadUrlGenerator()
	const downloadUrl = useMemo(() => {
		return generateCsvDownloadUrl(props.entries)
	}, [generateCsvDownloadUrl, props.entries])

	const columns = useMemo<ColumnDef<Entry>[]>(() => {
		return TRANSACTION_CSV_HEADERS.map((headerKey) => ({
			id: headerKey,
			header: headerKey,
			accessorFn: (entry) => getTransactionCsvValue(entry, headerKey),
			size: COLUMN_DEFAULT_SIZES[headerKey],
			minSize: COLUMN_MIN_SIZES[headerKey],
			cell: ({ getValue }) => {
				const val = String(getValue() ?? "")
				return (
					<div
						title={val}
						className={cn(
							"whitespace-pre overflow-hidden text-ellipsis leading-tight",
							headerKey === "is_positive" && "text-center",
							headerKey === "amount" && "text-right font-mono"
						)}
					>
						{val}
					</div>
				)
			}
		}))
	}, [])

	// eslint-disable-next-line react-hooks/incompatible-library
	const table = useReactTable({
		data: props.entries ?? [],
		columns,
		columnResizeMode: "onChange",
		getCoreRowModel: getCoreRowModel()
	})

	const renderContent = () => {
		if (isNonNullable(props.isLoading) && props.isLoading) {
			return (
				<div className="w-full h-full flex items-center justify-center">
					<ReloadIcon className="h-4 w-4 animate-spin" />
				</div>
			)
		}

		if (!isNonNullable(props.entries) || props.entries.length < 1) {
			return (
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<CircleSlashIcon />
						</EmptyMedia>
						<EmptyTitle>No Entry Available</EmptyTitle>
					</EmptyHeader>
				</Empty>
			)
		}

		return (
			<Table
				containerClassName="w-9/10 mx-auto overflow-auto flex-1 min-h-0 border rounded-md"
				className="w-auto table-fixed"
				style={{ width: `${table.getTotalSize()}px` }}
			>
				<TableHeader className="sticky top-0 bg-background z-10 shadow-xs">
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<TableHead
									key={header.id}
									style={{
										width: `${header.getSize()}px`,
										minWidth: `${header.column.columnDef.minSize}px`,
										position: "relative"
									}}
									className="px-2 h-10 select-none group bg-background"
									title={header.id}
								>
									<div className="truncate text-xs font-semibold">
										{flexRender(
											header.column.columnDef.header,
											header.getContext()
										)}
									</div>
									<div
										onMouseDown={header.getResizeHandler()}
										onTouchStart={header.getResizeHandler()}
										className={cn(
											"absolute right-0 top-0 h-full w-1.5 cursor-col-resize select-none touch-none hover:bg-primary/50 group-hover:bg-muted-foreground/30",
											header.column.getIsResizing() && "bg-primary w-2"
										)}
									/>
								</TableHead>
							))}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows.map((row) => (
						<TableRow key={row.id}>
							{row.getVisibleCells().map((cell) => (
								<TableCell
									key={cell.id}
									style={{
										width: `${cell.column.getSize()}px`,
										maxWidth: `${cell.column.getSize()}px`
									}}
									className="p-2 align-middle overflow-hidden text-xs"
								>
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</TableCell>
							))}
						</TableRow>
					))}
				</TableBody>
			</Table>
		)
	}

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
			{renderContent()}
			<DialogFooter className="gap-2 px-4 pb-4">
				<Button
					disabled={props.isLoading}
					className="aria-disabled:opacity-50 aria-disabled:pointer-events-none"
					asChild
				>
					<a
						href={downloadUrl ?? undefined}
						aria-disabled={props.isLoading}
						download={props.title ?? "FinTrack Report"}
					>
						{props.isLoading ? (
							<ReloadIcon className="size-4 animate-spin" />
						) : (
							<>
								Download
								<DownloadIcon />
							</>
						)}
					</a>
				</Button>
			</DialogFooter>
		</DialogContent>
	)
}
