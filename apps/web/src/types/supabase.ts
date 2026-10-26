import { useMonthGroupQuery } from "@/lib/queries"
import { DefinedQueryObserverResult } from "@tanstack/react-query"

type InferQueryType<T> =
	T extends DefinedQueryObserverResult<infer U>
		? U extends Array<infer V>
			? V
			: U
		: never

type MonthGroup = InferQueryType<ReturnType<typeof useMonthGroupQuery>>

export { type MonthGroup }
