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

const createFormDialogStore = (
	initialValues?: Partial<Pick<CurPageState, "curPage" | "categoryToEdit">>
) =>
	create<CurPageState>()((set) => ({
		curPage: initialValues?.curPage ?? 0,
		categoryToEdit: initialValues?.categoryToEdit,
		setCurPage: (val) =>
			set((state) => ({ curPage: isFunction(val) ? val(state.curPage) : val })),
		setCategoryToEdit: (val) =>
			set((state) => ({
				categoryToEdit: isFunction(val) ? val(state.categoryToEdit) : val
			}))
	}))
type FormDialogStore = ReturnType<typeof createFormDialogStore>

const FormDialogContext = createContext<FormDialogStore>(null!)

export function useFormDialog() {
	return useContext(FormDialogContext)
}

export default function FormDialogProvider(props: {
	initialValues?: Partial<Pick<CurPageState, "curPage" | "categoryToEdit">>
	children: JSX.Element
}) {
	const [storeHook, setStoreHook] = useState<FormDialogStore>(() =>
		createFormDialogStore(props.initialValues)
	)

	return (
		<FormDialogContext.Provider value={storeHook}>
			{props.children}
		</FormDialogContext.Provider>
	)
}
