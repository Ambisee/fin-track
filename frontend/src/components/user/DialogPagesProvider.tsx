import {
	createContext,
	Dispatch,
	SetStateAction,
	useContext,
	useState
} from "react"

interface DialogPagesObject {
	curPage: number
	setCurPage: Dispatch<SetStateAction<number>>
}

const DialogPagesContext = createContext<DialogPagesObject>(null!)

export function useDialogPages() {
	return useContext(DialogPagesContext)
}

export default function DialogPagesProvider(props: {
	initialValues?: Partial<Pick<DialogPagesObject, "curPage">>
	children: JSX.Element
}) {
	const [curPage, setCurPage] = useState(props.initialValues?.curPage ?? 0)

	return (
		<DialogPagesContext.Provider value={{ curPage, setCurPage }}>
			{props.children}
		</DialogPagesContext.Provider>
	)
}
