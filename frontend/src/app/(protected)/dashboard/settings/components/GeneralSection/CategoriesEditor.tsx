"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import CategoryGroup from "@/components/user/CategoryGroup"
import DialogPagesProvider, {
	useDialogPages
} from "@/components/user/DialogPagesProvider"
import CategoryPage from "@/components/user/EntryForm/CategoryPage"
import CategoryToEditProvider from "@/components/user/EntryForm/CategoryProvider"
import EditCategoryPage from "@/components/user/EntryForm/EditCategoryPage"

import { useCategoriesQuery } from "@/lib/hooks"

export default function CategoriesEditor() {
	const categoriesQuery = useCategoriesQuery()

	return (
		<Dialog>
			<div id="asdf" className="grid mt-8">
				<Label className="text-sm">Categories</Label>
				{!categoriesQuery.isFetched ? (
					<Skeleton className="w-full mt-2 h-10" />
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
					className="auto-rows-fr h-dvh max-w-none duration-0 border-0 sm:border sm:h-5/6 sm:min-h-[460px] sm:max-w-lg"
				>
					<CategoryGroup editModeOnly />
				</DialogContent>
			</div>
		</Dialog>
	)
}
