import { Entry } from "@/types/supabase"
import { isSetStateFunction } from "./utils"
import { Dispatch, SetStateAction } from "react"
import { create, StateCreator } from "zustand"

interface EntryFormState {
	open: boolean
	setOpen: Dispatch<SetStateAction<boolean>>

	data?: Entry
	setData: Dispatch<SetStateAction<Entry | undefined>>

	onSubmitSuccess?: (data: Entry, oldData?: Entry) => void
	setOnSubmitSuccess: (
		value: ((data: Entry, oldData?: Entry) => void) | undefined
	) => void

	// For the category page
	isCategoryEdit: boolean
	setIsCategoryEdit: Dispatch<SetStateAction<boolean>>
}

type GlobalState = EntryFormState

const sliceResetFns = new Set<() => void>()
const resetGlobalStore = () => {
	sliceResetFns.forEach((resetFn) => resetFn())
}

const initialEntryFormState = {
	open: false,
	data: undefined,
	onSubmitSuccess: undefined,
	isCategoryEdit: false
}
const createEntryFormState: StateCreator<
	GlobalState,
	[],
	[],
	EntryFormState
> = (set, get) => {
	sliceResetFns.add(() => set(initialEntryFormState))
	return {
		...initialEntryFormState,
		setOpen: (value) =>
			set((state) => ({
				open: isSetStateFunction(value) ? value(state.open) : value
			})),
		setData: (value) =>
			set((state) => ({
				data: isSetStateFunction(value) ? value(state.data) : value
			})),
		setOnSubmitSuccess: (value) => set(() => ({ onSubmitSuccess: value })),
		setIsCategoryEdit: (value) =>
			set((state) => ({
				isCategoryEdit: isSetStateFunction(value)
					? value(state.isCategoryEdit)
					: value
			}))
	}
}

const useGlobalStore = create<GlobalState>()((...a) => ({
	...createEntryFormState(...a)
}))

export default useGlobalStore
export { resetGlobalStore, type EntryFormState }
