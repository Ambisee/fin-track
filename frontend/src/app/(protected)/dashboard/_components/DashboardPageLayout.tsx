import LayoutLedgerEditorDialog from "./LayoutLedgerEditorDialog"

interface DashboardPageLayoutProps {
	children: React.ReactNode
	title: string
}

export function DashboardPageLayout(props: DashboardPageLayoutProps) {
	return (
		<>
			<div className="w-full flex justify-between items-center mb-4">
				<h1>{props.title}</h1>
				<LayoutLedgerEditorDialog />
			</div>
			{props.children}
		</>
	)
}
