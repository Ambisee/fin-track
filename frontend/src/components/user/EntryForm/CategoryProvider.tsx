import { Category } from "@/types/supabase"
import {
	createContext,
	Dispatch,
	SetStateAction,
	useContext,
	useState
} from "react"

interface CategoryToEditObject {
	categoryToEdit?: Category
	setCategoryToEdit: Dispatch<SetStateAction<Category | undefined>>
}

const CategoryToEditContext = createContext<CategoryToEditObject>(null!)

export function useCategoryToEdit() {
	return useContext(CategoryToEditContext)
}

export default function CategoryToEditProvider(props: {
	initialValues?: Partial<Pick<CategoryToEditObject, "categoryToEdit">>
	children: JSX.Element
}) {
	const [categoryToEdit, setCategoryToEdit] = useState(
		props.initialValues?.categoryToEdit
	)

	return (
		<CategoryToEditContext.Provider
			value={{ categoryToEdit, setCategoryToEdit }}
		>
			{props.children}
		</CategoryToEditContext.Provider>
	)
}
