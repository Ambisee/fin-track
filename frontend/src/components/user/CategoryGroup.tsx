import { useState } from "react"
import CategoriesListPage, {
	CategoriesListPageProps
} from "./CategoriesListPage"
import CategoryPage, {
	CategoryFormData,
	CategoryPageProps
} from "./CategoryPage"
import LedgersListPage from "./LedgersListPage"
import { Category } from "@/types/supabase"
import {
	useCategoriesQuery,
	useDeleteCategoryMutation,
	useInsertCategoryMutation,
	useUpdateCategoryMutation,
	useUserQuery
} from "@/lib/hooks"
import { useToast } from "../ui/use-toast"
import { useIsMutating, useQueryClient } from "@tanstack/react-query"
import { CATEGORIES_QKEY, SHORT_TOAST_DURATION } from "@/lib/constants"

interface CategoryGroupProps
	extends Omit<
		CategoriesListPageProps & CategoryPageProps,
		| "data"
		| "isEditMode"
		| "isInitialized"
		| "isLoading"
		| "categoriesList"
		| "currentCategory"
		| "onAddButton"
		| "onCreate"
		| "onDelete"
		| "onUpdate"
		| "onSelect"
	> {
	onCreate?: (category: Category) => void
	onSelect?: (category: Category, isEditing: boolean) => void
	onDelete?: (category: Category) => void
	onUpdate?: (category: Category) => void
}

export default function CategoryGroup(props: CategoryGroupProps) {
	const { toast } = useToast()

	const [curPage, setCurPage] = useState(0)
	const [isEditMode, setIsEditMode] = useState(false || !!props.editModeOnly)
	const [curCategory, setCurCategory] = useState<Category | undefined>(
		undefined
	)

	const queryClient = useQueryClient()
	const userQuery = useUserQuery()
	const categoriesQuery = useCategoriesQuery()

	const isCategoriesMutating = useIsMutating({ mutationKey: CATEGORIES_QKEY })

	const insertCategoryMutation = useInsertCategoryMutation()
	const onCreateCallback = async (category: CategoryFormData) => {
		const userData = userQuery.data
		if (!userData) {
			return
		}

		try {
			await insertCategoryMutation.mutateAsync({
				created_by: userData.id,
				name: category.name
			})

			toast({
				description: (
					<>
						New category created: <b>{category.name}</b>
					</>
				)
			})

			await queryClient.invalidateQueries({ queryKey: CATEGORIES_QKEY })
			props.onCreate?.({ created_by: userData.id, name: category.name })

			setCurPage(0)
		} catch (e) {
			const error = e as Error
			toast({
				description: error.message,
				variant: "destructive"
			})
		}
	}

	const updateCategoryMutation = useUpdateCategoryMutation()
	const onUpdateCallback = async (category: CategoryFormData) => {
		const userData = userQuery.data
		if (!userData) {
			return
		}

		try {
			await updateCategoryMutation.mutateAsync({
				oldName: category.oldName,
				created_by: userData.id,
				name: category.name
			})

			toast({
				description: "Category deleted",
				duration: SHORT_TOAST_DURATION
			})

			await queryClient.invalidateQueries({
				queryKey: CATEGORIES_QKEY
			})
			props.onDelete?.({ created_by: userData.id, name: category.name })
		} catch (e) {
			toast({
				description: `Unable to update the category: ${category.name}`,
				variant: "destructive"
			})
		}
	}

	const deleteCategoryMutation = useDeleteCategoryMutation()
	const onDeleteCallback = async (category: Category) => {
		const userData = userQuery.data
		if (!userData) {
			return
		}

		try {
			await deleteCategoryMutation.mutateAsync({
				created_by: userData.id,
				name: category.name
			})

			toast({
				description: "Category deleted",
				duration: SHORT_TOAST_DURATION
			})

			await queryClient.invalidateQueries({
				queryKey: CATEGORIES_QKEY
			})
			props.onDelete?.({ created_by: userData.id, name: category.name })
		} catch (e) {
			toast({
				description: `Unable to delete the category: ${category.name}`,
				variant: "destructive"
			})
		}
	}

	const isLoading = isCategoriesMutating > 0 || categoriesQuery.isFetching

	const Component = [
		<CategoriesListPage
			key="categories-list-page"
			isEditMode={isEditMode}
			isLoading={isLoading}
			editModeOnly={props.editModeOnly}
			isInitialized={!categoriesQuery.isLoading && !userQuery.isLoading}
			currentCategory={curCategory}
			categoriesList={categoriesQuery.data ?? []}
			onBackButton={props.onBackButton}
			onAddButton={() => {
				setCurCategory(undefined)
				setCurPage(1)
			}}
			onDelete={onDeleteCallback}
			onSelect={async (category, isEditing) => {
				if (isEditing) {
					setCurCategory(category)
					setCurPage(1)
				} else {
					props.onSelect?.(category, false)
				}
			}}
		/>,
		<CategoryPage
			key="category-page"
			data={curCategory}
			isLoading={isLoading}
			isInitialized={!categoriesQuery.isLoading && !userQuery.isLoading}
			onCreate={onCreateCallback}
			onUpdate={onUpdateCallback}
			onBackButton={() => {
				setCurCategory(undefined)
				setIsEditMode(true)
				setCurPage(0)
			}}
		/>
	]

	return Component[curPage]
}
