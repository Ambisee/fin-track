import { CATEGORIES_QKEY, SHORT_TOAST_DURATION } from "@/lib/constants"
import {
	useCategoriesQuery,
	useDeleteCategoryMutation,
	useInsertCategoryMutation,
	useUpdateCategoryMutation,
	useUserQuery
} from "@/lib/hooks"
import { Category } from "@/types/supabase"
import { useIsMutating, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"
import CategoriesListPage, {
	CategoriesListPageProps
} from "./CategoriesListPage"
import CategoryPage, {
	CategoryFormData,
	CategoryPageProps
} from "./CategoryPage"

interface CategoryGroupProps extends Omit<
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

			toast.info(
				<>
					New category created: <b>{category.name}</b>
				</>
			)

			await queryClient.invalidateQueries({ queryKey: CATEGORIES_QKEY })
			props.onCreate?.({ created_by: userData.id, name: category.name })

			setCurPage(0)
		} catch (e) {
			const error = e as Error
			toast.error(error.message)
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

			toast.info("Category updated", { duration: SHORT_TOAST_DURATION })

			await queryClient.invalidateQueries({
				queryKey: CATEGORIES_QKEY
			})
			props.onDelete?.({ created_by: userData.id, name: category.name })
		} catch (e) {
			const errorData = e as Error
			toast.error(errorData.message)
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

			toast.info("Category deleted", { duration: SHORT_TOAST_DURATION })

			await queryClient.invalidateQueries({
				queryKey: CATEGORIES_QKEY
			})
			props.onDelete?.({ created_by: userData.id, name: category.name })
		} catch (e) {
			const errorData = e as Error
			toast.error(errorData.message)
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
