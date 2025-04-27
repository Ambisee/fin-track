"use client"

import useGlobalStore from "@/lib/store"
import { cn, isNonNullable } from "@/lib/utils"
import { Entry } from "@/types/supabase"
import { useQueryClient } from "@tanstack/react-query"
import { useVirtualizer, useWindowVirtualizer } from "@tanstack/react-virtual"
import { useEffect, useRef } from "react"
import { Button } from "../ui/button"
import { DialogTrigger } from "../ui/dialog"
import EntryListItem from "./EntryListItem"
import { QueryHelper } from "@/lib/helper/QueryHelper"

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
	const expandedRef = useRef<boolean[]>([])
	const listRef = useRef<HTMLDivElement>(null)

	const virtualizer = useWindowVirtualizer({
		count: data.length,
		estimateSize: () => 100,
		overscan: 3,
		gap: 16,
		scrollMargin: listRef.current?.offsetTop ?? 0
	})

	useEffect(() => {
		expandedRef.current = Array(data.length ?? 0).fill(false)
	}, [data])

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
								expanded={expandedRef.current[it.index]}
								showButtons={props.showButtons}
								data={data!.at(it.index)!}
								onEdit={props.onEditItem}
								onExpand={(value) => {
									expandedRef.current[it.index] = value
								}}
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
	const queryClient = useQueryClient()
	const setData = useGlobalStore((state) => state.setData)
	const setOnSubmitSuccess = useGlobalStore((state) => state.setOnSubmitSuccess)

	if (props.data.length < 1) {
		const dataCopy = [...props.data]

		return (
			<div className="px-0 py-12 grid gap-2 items-center justify-center">
				<p className="text-center">No entry data available for this period.</p>
				<DialogTrigger asChild>
					<Button
						className="w-fit justify-self-center"
						onClick={() => {
							setData(undefined)
							setOnSubmitSuccess((data) => {
								queryClient.invalidateQueries({
									queryKey: QueryHelper.getEntryQueryKey(
										data.ledger,
										new Date(data.date)
									)
								})
								queryClient.invalidateQueries({
									queryKey: QueryHelper.getStatisticQueryKey(
										data.ledger,
										new Date(data.date)
									)
								})
							})
						}}
					>
						Add an entry
					</Button>
				</DialogTrigger>
			</div>
		)
	}

	const Component = Components[virtualizerType]
	return <Component showButtons={showButtons} {...props} />
}

EntryList.VirtualizerType = EntryListVirtualizerType
