import {
	ComponentProps,
	Dispatch,
	SetStateAction,
	useEffect,
	useRef,
	useState
} from "react"
import { Input } from "../ui/input"
import { useSearch } from "@/lib/hooks"
import { Entry } from "@/types/supabase"

interface EntrySearchBarProps
	extends Omit<ComponentProps<typeof Input>, "value" | "onChange"> {
	/**
	 * Initial search value to be displayed on the search bar.
	 */
	searchQuery?: string
	onSearchResult: (searchResult: Entry[] | null) => void

	/**
	 * Duration to wait before calling the search callback,
	 * within which there are no changes to the search input
	 */
	timeout?: number
}

export default function EntrySearchBar(props: EntrySearchBarProps) {
	const searchResultCallbackRef = useRef(props.onSearchResult)
	const { searchQuery, searchResult, setSearchQuery } = useSearch()

	useEffect(() => {
		searchResultCallbackRef.current(searchResult)
	}, [searchResult])

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
