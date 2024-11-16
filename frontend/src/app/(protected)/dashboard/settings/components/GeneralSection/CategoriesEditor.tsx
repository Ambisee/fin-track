"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import DialogPagesProvider, {
	useDialogPages
} from "@/components/user/DialogPagesProvider"
import CategoryPage from "@/components/user/EntryForm/CategoryPage"
import CategoryToEditProvider from "@/components/user/EntryForm/CategoryProvider"
import EditCategoryPage from "@/components/user/EntryForm/EditCategoryPage"

import { useCategoriesQuery } from "@/lib/hooks"

function CategoriesContent() {
	const { curPage, setCurPage } = useDialogPages()

	const categoriesQuery = useCategoriesQuery()

	const renderPage = () => {
		const pages = [EditCategoryPage, CategoryPage]
		const CurrentPage = pages[curPage]

		if (CurrentPage === undefined) return undefined

		return <CurrentPage showBackButton={curPage !== 0} />
	}

	return (
		<Dialog>
			<div id="asdf" className="grid mt-8">
				<Label className="text-sm">Categories</Label>
				{!categoriesQuery.isFetched ? (
					<Skeleton className="w-full h-10" />
				) : (
					<DialogTrigger className="mt-2" asChild>
						<Button>Open category editor</Button>
					</DialogTrigger>
				)}
				<p className="mt-2 text-muted-foreground text-sm">
					All categories created will be available for all ledgers.
				</p>
				<DialogContent
					hideCloseButton
					onOpenAutoFocus={() => {
						setCurPage(0)
					}}
					onSubmit={(e) => {
						e.stopPropagation()
					}}
					className="auto-rows-fr h-dvh max-w-none duration-0 border-0 sm:border sm:h-5/6 sm:min-h-[460px] sm:max-w-lg"
				>
					{renderPage()}
				</DialogContent>
			</div>
		</Dialog>
	)
}

export default function CategoriesEditor() {
	return (
		<DialogPagesProvider initialValues={{ curPage: 0 }}>
			<CategoryToEditProvider>
				<CategoriesContent />
			</CategoryToEditProvider>
		</DialogPagesProvider>
	)
}
