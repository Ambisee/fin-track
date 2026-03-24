import EntryForm from "@/components/user/EntryForm/EntryForm"
import useGlobalStore from "@/lib/store"

export default function LayoutEntryDialogContent() {
	const data = useGlobalStore((state) => state.data)
	const onSubmitSuccess = useGlobalStore((state) => state.onSubmitSuccess)

	return <EntryForm data={data} onSubmitSuccess={onSubmitSuccess} />
}
