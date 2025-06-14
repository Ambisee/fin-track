import { useSearchEntry } from "@/lib/hooks"
import { Entry } from "@/types/supabase"
import { ComponentProps, useEffect, useRef } from "react"
import { Input } from "../ui/input"

interface EntrySearchBarProps
	extends Omit<ComponentProps<typeof Input>, "value" | "onChange"> {
	/**
	 * Initial search value to be displayed on the search bar.
	 */
	searchQuery?: string

	/**
	 * Callback function to be called when the search function
	 * returns a list of entry as a result.
	 *
	 * @param searchResult
	 *      The list of entries which returns a match with the search query.
	 * @returns
	 */
	onSearchResult: (searchResult: Entry[] | null) => void

	/**
	 * Callback function to be called when the search function is called or
	 * returned.
	 *
	 * @param state
	 *      true, if the search function has been invoked and is currently querying for result. false, if idle or search function has returned a result.
	 * @returns
	 */
	onSearchStateChange?: (state: boolean) => void

	/**
	 * Duration to wait before calling the search callback,
	 * within which there are no changes to the search input
	 */
	timeout?: number
}

export default function EntrySearchBar(props: EntrySearchBarProps) {
	const { searchQuery, searchResult, isSearching, setSearchQuery } =
		useSearchEntry()

	useEffect(() => {
		props.onSearchResult(searchResult)

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchResult])

	useEffect(() => {
		props.onSearchStateChange?.(isSearching)

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isSearching])

	return (
		<Input
			value={searchQuery}
			onChange={(e) => {
				e.preventDefault()
				setSearchQuery(e.target.value)
			}}
			{...props}
		/>
	)
}
