import { create, UseBoundStore } from "zustand"
import { isFunction } from "@/lib/utils"
import {
	createContext,
	Dispatch,
	SetStateAction,
	useContext,
	useEffect,
	useState
} from "react"
import { Category } from "@/types/supabase"

interface CurPageState {
	curPage: number
	setCurPage: Dispatch<SetStateAction<number>>
	categoryToEdit?: Category
	setCategoryToEdit: Dispatch<SetStateAction<Category | undefined>>
}

const createEntryFormStore = () =>
	create<CurPageState>()((set, get) => ({
		curPage: 0,
		categoryToEdit: undefined,
		setCurPage: (val) =>
			set((state) => ({ curPage: isFunction(val) ? val(state.curPage) : val })),
		setCategoryToEdit: (val) =>
			set((state) => ({
				categoryToEdit: isFunction(val) ? val(state.categoryToEdit) : val
			}))
	}))
type EntryFormStore = ReturnType<typeof createEntryFormStore>

const EntryFormContext = createContext<EntryFormStore>(null!)

export function useEntryFormStore() {
	return useContext(EntryFormContext)
}

export default function EntryFormProvider(props: { children: JSX.Element }) {
	const [storeHook, setStoreHook] = useState<EntryFormStore>(() =>
		createEntryFormStore()
	)

	return (
		<EntryFormContext.Provider value={storeHook}>
			{props.children}
		</EntryFormContext.Provider>
	)
}
