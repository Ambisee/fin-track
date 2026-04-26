"use client"

import useGlobalStore from "@/lib/store"
import { isNonNullable } from "@/lib/utils"
import { Entry } from "@/types/supabase"
import { useQueryClient } from "@tanstack/react-query"
import { useVirtualizer, useWindowVirtualizer } from "@tanstack/react-virtual"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { Button } from "../ui/button"
import { DialogTrigger } from "../ui/dialog"
import EntryListItem from "./EntryListItem"
import { QueryHelper } from "@/lib/helper/QueryHelper"
import { DateHelper } from "@/lib/helper/DateHelper"
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle
} from "../ui/empty"
import ConditionalWrapper from "./ConditionalWrapper"

enum EntryListVirtualizerType {
	NONE,
	NORMAL_VIRTUALIZER,
	WINDOW_VIRTUALIZER
}

interface EntryListProps {
	data: Entry[]
	showButtons?: boolean
	virtualizerType?: EntryListVirtualizerType

	onEditItem?: (data: Entry) => void
	onScrollToBottom?: () => void
}

function EmptyEntryList() {
	const queryClient = useQueryClient()
	const setData = useGlobalStore((state) => state.setData)
	const setOnSubmitSuccess = useGlobalStore((state) => state.setOnSubmitSuccess)

	return (
		<Empty className="border border-dashed">
			<EmptyHeader>
				<EmptyTitle>No transaction entries.</EmptyTitle>
				<EmptyDescription>
					Transaction entries added will be shown here.
				</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<DialogTrigger asChild>
					<Button
						className="w-fit justify-self-center"
						onClick={() => {
							setData(undefined)
							setOnSubmitSuccess((data) => {
								const monthStartEnd = DateHelper.getMonthStartEnd(
									new Date(data.date)
								)

								const entryQueryKey = QueryHelper.getEntryQueryKey(
									data.ledger,
									monthStartEnd
								)

								queryClient.invalidateQueries({ queryKey: entryQueryKey })
								queryClient.invalidateQueries({
									queryKey: QueryHelper.getStatisticQueryKey(
										data.ledger,
										monthStartEnd
									)
								})
							})
						}}
					>
						Add an entry
					</Button>
				</DialogTrigger>
			</EmptyContent>
		</Empty>
	)
}

function NormalList(props: EntryListProps) {
	const { data, onScrollToBottom, ...restProps } = props
	const lastItemRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.target === lastItemRef.current && entry.isIntersecting) {
						onScrollToBottom?.()
						break
					}
				}
			},
			{ threshold: 1 }
		)

		let lastItem = null
		if (isNonNullable(lastItemRef.current)) {
			lastItem = lastItemRef.current
			observer.observe(lastItem)
		}

		return () => {
			if (isNonNullable(lastItem)) observer.unobserve(lastItem)
		}
	}, [data, onScrollToBottom])

	return (
		<div className="w-full grid gap-4">
			{data.map((val, index) => (
				<div key={val.id} ref={index === data.length - 1 ? lastItemRef : null}>
					<EntryListItem
						data={val}
						showButtons={restProps.showButtons}
						onEdit={restProps.onEditItem}
					/>
				</div>
			))}
		</div>
	)
}

function VirtualizedList(props: EntryListProps) {
	const { data, onScrollToBottom } = props
	const expandedRef = useRef<boolean[]>([])
	const listRef = useRef<HTMLDivElement>(null)

	// [TEMPORARY] Disable memoization warning for this API.
	// eslint-disable-next-line react-hooks/incompatible-library
	const virtualizer = useVirtualizer({
		count: data.length,
		estimateSize: () => 100,
		getScrollElement: () => listRef.current,
		overscan: 5,
		gap: 16
	})

	useEffect(() => {
		expandedRef.current = Array(data.length).fill(false)
	}, [data])

	useEffect(() => {
		if (virtualizer.getVirtualIndexes().at(-1) === data.length - 1) {
			onScrollToBottom?.()
		}
	}, [data, virtualizer, onScrollToBottom])

	const virtualItems = virtualizer.getVirtualItems()

	return (
		<div ref={listRef} className="w-full h-full overflow-y-auto">
			<div
				className="w-full relative"
				style={{
					height: `${virtualizer.getTotalSize()}px`
				}}
			>
				<div
					className="grid gap-4 absolute top-0 left-0 w-full"
					style={{
						transform: `translateY(${virtualItems[0]?.start ?? 0}px)`
					}}
				>
					{virtualItems.map((value) => (
						<div
							key={value.key}
							ref={virtualizer.measureElement}
							data-index={value.index}
						>
							<EntryListItem
								data={data[value.index]}
								onEdit={props.onEditItem}
								showButtons={props.showButtons}
							/>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}

function WindowVirtualizedList(props: EntryListProps) {
	const { data, onScrollToBottom } = props
	const listRef = useRef<HTMLDivElement>(null)
	const listOffsetRef = useRef<number>(0)
	const [expanded, setExpanded] = useState(Array(data.length ?? 0).fill(false))

	useLayoutEffect(() => {
		listOffsetRef.current = listRef.current?.offsetTop ?? 0
	}, [])

	const virtualizer = useWindowVirtualizer({
		count: data.length,
		estimateSize: () => 100,
		overscan: 3,
		gap: 16,

		// eslint-disable-next-line react-hooks/refs
		scrollMargin: listOffsetRef.current
	})

	const virtualItems = virtualizer.getVirtualItems()
	const y = (virtualItems[0]?.start ?? 0) - virtualizer.options.scrollMargin

	useEffect(() => {
		const [lastItem] = [...virtualItems].reverse()
		if (!lastItem) {
			return
		}

		if (lastItem.index >= data.length - 1) {
			onScrollToBottom?.()
		}
	}, [data, virtualItems, onScrollToBottom])

	return (
		<div ref={listRef}>
			<div
				className="w-full grid gap-4 relative"
				style={{ height: `${virtualizer.getTotalSize()}px` }}
			>
				<div
					className="grid gap-4"
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						width: "100%",
						transform: `translateY(${y}px)`
					}}
				>
					{virtualItems.map((it) => (
						<div
							key={it.key}
							data-index={it.index}
							ref={virtualizer.measureElement}
						>
							<EntryListItem
								expand={expanded[it.index]}
								showButtons={props.showButtons}
								data={data!.at(it.index)!}
								onEdit={props.onEditItem}
								onExpand={(value) =>
									setExpanded((cur) => {
										const newExpanded = [...cur]
										newExpanded[it.index] = value
										return newExpanded
									})
								}
							/>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}

const Components = [NormalList, VirtualizedList, WindowVirtualizedList]

export default function EntryList({
	showButtons = true,
	virtualizerType = EntryListVirtualizerType.NONE,
	...props
}: EntryListProps) {
	// const queryClient = useQueryClient()
	// const setData = useGlobalStore((state) => state.setData)
	// const setOnSubmitSuccess = useGlobalStore((state) => state.setOnSubmitSuccess)

	// if (props.data.length < 1) {
	// 	return (
	// 		<div className="px-0 py-12 grid gap-2 items-center justify-center">
	// 			<p className="text-center">No entry data available for this period.</p>
	// 			<DialogTrigger asChild>
	// 				<Button
	// 					className="w-fit justify-self-center"
	// 					onClick={() => {
	// 						setData(undefined)
	// 						setOnSubmitSuccess((data) => {
	// 							const monthStartEnd = DateHelper.getMonthStartEnd(
	// 								new Date(data.date)
	// 							)

	// 							const entryQueryKey = QueryHelper.getEntryQueryKey(
	// 								data.ledger,
	// 								monthStartEnd
	// 							)

	// 							queryClient.invalidateQueries({ queryKey: entryQueryKey })
	// 							queryClient.invalidateQueries({
	// 								queryKey: QueryHelper.getStatisticQueryKey(
	// 									data.ledger,
	// 									monthStartEnd
	// 								)
	// 							})
	// 						})
	// 					}}
	// 				>
	// 					Add an entry
	// 				</Button>
	// 			</DialogTrigger>
	// 		</div>
	// 	)
	// }

	const Component = Components[virtualizerType]
	return (
		<ConditionalWrapper
			showContent={props.data.length > 0}
			fallback={<EmptyEntryList />}
		>
			<Component showButtons={showButtons} {...props} />
		</ConditionalWrapper>
	)
}

EntryList.VirtualizerType = EntryListVirtualizerType
