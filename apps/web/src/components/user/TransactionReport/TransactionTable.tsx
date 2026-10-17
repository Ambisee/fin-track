import { View } from "@react-pdf/renderer"
import type { AmountFormatter, DateFormatter, Entry } from "./types"
import { TransactionRow } from "./TransactionRow"
import { TransactionTableHeader } from "./TransactionTableHeader"
import { TableSummary } from "./TableSummary"

export const TransactionTable = ({
	entries,
	formatDate,
	formatAmount
}: {
	entries: Entry[]
	locale?: string
	formatDate: DateFormatter
	formatAmount: AmountFormatter
}) => {
	// The last two entries + the summary are kept together as one block so the totals never end up alone on a new page.
	const splitAt = Math.max(0, entries.length - 2)
	const head = entries.slice(0, splitAt)
	const tail = entries.slice(splitAt)

	return (
		<View>
			{/* Regular header at the start of the table (page 1) */}
			<TransactionTableHeader />
			{/* Repeated header on continuation pages */}
			<View
				fixed
				render={({ pageNumber }) =>
					pageNumber > 1 ? <TransactionTableHeader /> : null
				}
			/>

			{head.map((entry, i) => (
				<TransactionRow
					key={i}
					entry={entry}
					index={i}
					formatDate={formatDate}
					formatAmount={formatAmount}
				/>
			))}

			<View wrap={false}>
				{tail.map((entry, i) => (
					<TransactionRow
						key={splitAt + i}
						entry={entry}
						index={splitAt + i}
						isLast={i === tail.length - 1}
						formatDate={formatDate}
						formatAmount={formatAmount}
					/>
				))}
				<TableSummary entries={entries} formatAmount={formatAmount} />
			</View>
		</View>
	)
}
