"use client"

import useGlobalStore from "@/lib/store"
import { isNonNullable } from "@/lib/utils"
import { Entry } from "@/types/Entry"
import { useQueryClient } from "@tanstack/react-query"
import { useVirtualizer, useWindowVirtualizer } from "@tanstack/react-virtual"
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState
} from "react"
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
import { useInvalidateEntryDataQuery } from "@/lib/queries"

enum EntryListVirtualizerType {
	NONE,
	NORMAL_VIRTUALIZER,
	WINDOW_VIRTUALIZER
}

// Shared expand-state controller, lifted once here and passed to every list variant.
function useExpandedIds() {
	const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())

	const isExpanded = (id: number) => expandedIds.has(id)
	const setExpanded = (id: number, value: boolean) => {
		setExpandedIds((cur) => {
			const next = new Set(cur)
			if (value) {
				next.add(id)
			} else {
				next.delete(id)
			}
			return next
		})
	}

	return { isExpanded, setExpanded }
}

interface EntryListProps {
	data: Entry[]
	showButtons?: boolean
	virtualizerType?: EntryListVirtualizerType

	onEditItem?: (data: Entry) => void
	onScrollToBottom?: () => void
}

// Internal prop shape shared by all three list variants once expand state is lifted.
interface InnerListProps extends EntryListProps {
	isExpanded: (id: number) => boolean
	setExpanded: (id: number, value: boolean) => void
}

function EmptyEntryList() {
	const queryClient = useQueryClient()
	const invaldiateEntryQuery = useInvalidateEntryDataQuery()

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

								invaldiateEntryQuery(data.ledger.id, monthStartEnd)

								queryClient.invalidateQueries({
									queryKey: QueryHelper.getStatisticQueryKey(
										data.ledger.id,
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

function NormalList(props: InnerListProps) {
	const { data, onScrollToBottom, isExpanded, setExpanded, ...restProps } =
		props
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
						expand={isExpanded(val.id)}
						onExpand={(value) => setExpanded(val.id, value)}
						showButtons={restProps.showButtons}
						onEdit={restProps.onEditItem}
					/>
				</div>
			))}
		</div>
	)
}

function VirtualizedList(props: InnerListProps) {
	const { data, onScrollToBottom, isExpanded, setExpanded } = props
	const listRef = useRef<HTMLDivElement>(null)

	const estimateSize = useCallback(() => 100, [])
	const getScrollElement = useCallback(() => listRef.current, [])
	const getItemKey = useCallback((index: number) => data[index].id, [data])

	// [TEMPORARY] Disable memoization warning for this API.
	// eslint-disable-next-line react-hooks/incompatible-library
	const virtualizer = useVirtualizer({
		count: data.length,
		estimateSize,
		getScrollElement,
		getItemKey,
		overscan: 5,
		gap: 16
	})

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
					{virtualItems.map((value) => {
						const item = data[value.index]
						return (
							<div
								key={value.key}
								ref={virtualizer.measureElement}
								data-index={value.index}
							>
								<EntryListItem
									data={item}
									expand={isExpanded(item.id)}
									onExpand={(v) => setExpanded(item.id, v)}
									onEdit={props.onEditItem}
									showButtons={props.showButtons}
								/>
							</div>
						)
					})}
				</div>
			</div>
		</div>
	)
}

function WindowVirtualizedList(props: InnerListProps) {
	const { data, onScrollToBottom, isExpanded, setExpanded } = props
	const listRef = useRef<HTMLDivElement>(null)
	const [scrollMargin, setScrollMargin] = useState(0)

	useLayoutEffect(() => {
		setScrollMargin(listRef.current?.offsetTop ?? 0)
	}, [])

	const estimateSize = useCallback(() => 100, [])
	const getItemKey = useCallback((index: number) => data[index].id, [data])

	const virtualizer = useWindowVirtualizer({
		count: data.length,
		estimateSize,
		getItemKey,
		overscan: 3,
		gap: 16,
		scrollMargin
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
					{virtualItems.map((it) => {
						const item = data.at(it.index)!
						return (
							<div
								key={it.key}
								data-index={it.index}
								ref={virtualizer.measureElement}
							>
								<EntryListItem
									expand={isExpanded(item.id)}
									showButtons={props.showButtons}
									data={item}
									onEdit={props.onEditItem}
									onExpand={(value) => setExpanded(item.id, value)}
								/>
							</div>
						)
					})}
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
	const { isExpanded, setExpanded } = useExpandedIds()
	const Component = Components[virtualizerType]

	return (
		<ConditionalWrapper
			showContent={props.data.length > 0}
			fallback={<EmptyEntryList />}
		>
			<Component
				showButtons={showButtons}
				isExpanded={isExpanded}
				setExpanded={setExpanded}
				{...props}
			/>
		</ConditionalWrapper>
	)
}

EntryList.VirtualizerType = EntryListVirtualizerType
