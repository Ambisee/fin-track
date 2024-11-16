import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import DialogPagesProvider, {
	useDialogPages
} from "@/components/user/DialogPagesProvider"
import { useSettingsQuery, useUserQuery } from "@/lib/hooks"
import LedgerPage from "./LedgerPage"
import LedgerToEditProvider from "./LedgerProvider"
import LedgersListPage from "./LedgersListPage"

function LedgersEditorContent() {
	const { curPage, setCurPage } = useDialogPages()
	const userQuery = useUserQuery()
	const settingsQuery = useSettingsQuery()

	const renderPage = () => {
		const pages = [
			(props: any) => <LedgersListPage {...props} />,
			(props: any) => <LedgersListPage isEditMode={true} {...props} />,
			LedgerPage
		]
		const CurrentPage = pages[curPage]
		const props = { showBackButton: !(curPage === 0) }

		return <CurrentPage {...props} />
	}

	return (
		<Dialog>
			<div id="ledgers-editor" className="grid pt-4 mt-4">
				<Label className="text-sm">Ledgers</Label>
				<div className="mt-2 p-4 rounded-md border">
					<div className="flex justify-between items-center">
						<span className="text-md text-muted-foreground">
							Current ledger
						</span>
						{userQuery.isLoading || settingsQuery.isLoading ? (
							<Skeleton className="rounded-full h-8" />
						) : (
							<span className="text-sm bg-secondary text-secondary-foreground rounded-full py-0.5 px-6">
								{settingsQuery.data?.data?.ledger?.name}
							</span>
						)}
					</div>
					<div className="flex mt-4">
						{userQuery.isLoading || settingsQuery.isLoading ? (
							<Skeleton className="w-full h-10" />
						) : (
							<DialogTrigger className="w-full" asChild>
								<Button>Select or edit your ledgers</Button>
							</DialogTrigger>
						)}
					</div>
				</div>
				<DialogContent
					hideCloseButton
					onSubmit={(e) => e.stopPropagation()}
					onOpenAutoFocus={() => setCurPage(0)}
					className="auto-rows-fr h-dvh max-w-none duration-0 border-0 sm:border sm:h-5/6 sm:min-h-[460px] sm:max-w-lg"
				>
					{renderPage()}
				</DialogContent>
			</div>
		</Dialog>
	)
}

export default function LedgersEditor() {
	return (
		<DialogPagesProvider initialValues={{ curPage: 0 }}>
			<LedgerToEditProvider>
				<LedgersEditorContent />
			</LedgerToEditProvider>
		</DialogPagesProvider>
	)
}
