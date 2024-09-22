import { Entry } from "@/types/supabase"
import { PostgrestSingleResponse } from "@supabase/supabase-js"
import { Session } from "inspector"
import { Dispatch, SetStateAction } from "react"
import { create, StateCreator } from "zustand"

interface EntryFormState {
    open: boolean
    setOpen: Dispatch<SetStateAction<boolean>>

    data?: Entry
    setData: Dispatch<SetStateAction<Entry | undefined>>

    onSubmitSuccess?: ((data: PostgrestSingleResponse<null>) => void)
    setOnSubmitSuccess: (value: ((data: PostgrestSingleResponse<null>) => void) | undefined ) => void

    // For the category page
    isCategoryEdit: boolean
    setIsCategoryEdit: Dispatch<SetStateAction<boolean>>
    
    currentPage: number
    setCurrentPage: Dispatch<SetStateAction<number>>
}

type GlobalState = EntryFormState

const sliceResetFns = new Set<() => void>()
const isFunction = (value: any): value is Function => (typeof value === "function")
const resetGlobalStore = () => {
    sliceResetFns.forEach((resetFn) => resetFn())
}

const initialEntryFormState = {
    open: false,
    data: undefined,
    onSubmitSuccess: undefined,
    isCategoryEdit: false,
    currentPage: 0,
}
const createEntryFormState: StateCreator<GlobalState, [], [], EntryFormState> = (set, get) => {
    sliceResetFns.add(() => set(initialEntryFormState))
    return {
        ...initialEntryFormState,
        setOpen: (value) => set((state) => ({open: isFunction(value) ? value(state.open) : value})),
        setData: (value) => set((state) => ({data: isFunction(value) ? value(state.data) : value })),
        setOnSubmitSuccess: (value) => set((state) => ({onSubmitSuccess: value})),
        setIsCategoryEdit: (value) => set((state) => ({isCategoryEdit: isFunction(value) ? value(state.isCategoryEdit) : value})),
        setCurrentPage: (value) => set((state) => ({currentPage: isFunction(value) ? value(state.currentPage) : value})),
    }
}

const useGlobalStore = create<GlobalState>()((...a) => ({
    ...createEntryFormState(...a)
}))

export default useGlobalStore
export { resetGlobalStore }