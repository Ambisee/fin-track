import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import CategoryPage from "@/components/user/EntryForm/CategoryPage"
import EditCategoryPage from "@/components/user/EntryForm/EditCategoryPage"
import FormDialogProvider, {
	useFormDialog
} from "@/components/user/EntryForm/FormDialogProvider"
import { useCategoriesQuery } from "@/lib/hooks"
import { useState } from "react"

function CategoriesContent() {
	const curPage = useFormDialog()((state) => state.curPage)

	const categoriesQuery = useCategoriesQuery()

	const renderPage = () => {
		const pages = [EditCategoryPage, CategoryPage]
		const CurrentPage = pages[curPage]

		if (CurrentPage === undefined) return undefined

		return <CurrentPage showBackButton={curPage !== 0} />
	}

	return (
		<Dialog>
			<Label>Categories</Label>
			<DialogTrigger className="mt-2" asChild>
				{categoriesQuery.isLoading ? (
					<Skeleton className="w-full h-10" />
				) : (
					<Button>Open category editor</Button>
				)}
			</DialogTrigger>
			<DialogContent
				hideCloseButton
				onSubmit={(e) => e.stopPropagation()}
				className="auto-rows-fr h-dvh max-w-none duration-0 border-0 sm:border sm:h-5/6 sm:min-h-[460px] sm:max-w-lg"
			>
				{renderPage()}
			</DialogContent>
		</Dialog>
	)
}

export default function Categories() {
	return (
		<FormDialogProvider initialValues={{ curPage: 0 }}>
			<CategoriesContent />
		</FormDialogProvider>
	)
}
