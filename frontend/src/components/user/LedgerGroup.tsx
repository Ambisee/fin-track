import { useState } from "react"
import LedgerPage, { LedgerFormData, LedgerPageProps } from "./LedgerPage"
import LedgersListPage, { LedgersListPageProps } from "./LedgersListPage"
import { Ledger } from "@/types/supabase"
import {
	useCurrenciesQuery,
	useDeleteLedgerMutation,
	useInsertLedgerMutation,
	useLedgersQuery,
	useSettingsQuery,
	useSwitchLedgerMutation,
	useUpdateLedgerMutation,
	useUserQuery
} from "@/lib/hooks"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "../ui/use-toast"
import { USER_SETTINGS_QKEY } from "@/lib/constants"
import { PostgrestError } from "@supabase/supabase-js"

interface LedgerGroupProps
	extends Omit<
		LedgersListPageProps & LedgerPageProps,
		"onAddButton" | "currencyList" | "ledgersList" | "isLoading" | "data"
	> {
	/**
	 * Set this flag to `false` to directly call the `props.onSelect`
	 * callback, skipping the HTTP request to switch the current ledger.
	 */
	shouldUseSelectRequest?: boolean
}

export default function LedgerGroup(props: LedgerGroupProps) {
	const [isEditMode, setIsEditMode] = useState(false)
	const [currentPage, setCurrentPage] = useState(0)
	const [currentLedger, setCurrentLedger] = useState<Ledger | undefined>()

	const userQuery = useUserQuery()
	const currenciesQuery = useCurrenciesQuery()
	const ledgersQuery = useLedgersQuery()
	const settingsQuery = useSettingsQuery()

	const { toast } = useToast()
	const queryClient = useQueryClient()

	const insertLedgerMutation = useInsertLedgerMutation()
	const onCreateCallback = (ledger: LedgerFormData) => {
		const userID = userQuery.data?.data.user?.id
		if (!userID) {
			toast({ description: "No user ID found" })
			return
		}

		const payload: Parameters<typeof insertLedgerMutation.mutate>[0] = {
			...ledger,
			created_by: userID
		}

		insertLedgerMutation.mutate(payload, {
			onError: (errorData: Error) => {
				// Hard-coded error handler for duplicate ledger name
				if (errorData.cause == undefined) {
					toast({
						description: errorData.message,
						variant: "destructive"
					})
				}

				if ((errorData.cause as PostgrestError).code === "23505") {
					toast({
						description:
							"The ledger name has been used. Please enter another one",
						variant: "destructive"
					})
				}
			},
			onSuccess: (successData) => {
				if (!successData) return

				toast({
					description: "New ledger created",
					duration: 1500
				})

				props.onCreate?.(successData)
				setCurrentPage(0)
			}
		})
	}

	const updateLedgerMutation = useUpdateLedgerMutation()
	const onUpdateCallback = (ledger: LedgerFormData) => {
		const userID = userQuery.data?.data.user?.id
		if (!userID) {
			toast({ description: "No user ID found" })
			return
		}

		const payload: Parameters<typeof updateLedgerMutation.mutate>[0] = {
			...ledger,
			created_by: userID
		}

		updateLedgerMutation.mutate(payload, {
			onError: (errorData) => {
				// Hard-coded error handler for duplicate ledger name
				if (errorData.cause == undefined) {
					toast({
						description: errorData.message,
						variant: "destructive"
					})
				}

				if ((errorData.cause as PostgrestError).code === "23505") {
					toast({
						description:
							"The ledger name has been used. Please enter another one",
						variant: "destructive"
					})
				}
			},
			onSuccess: (successData) => {
				if (!successData) return

				toast({
					description: "Ledger updated",
					duration: 1500
				})

				props.onUpdate?.(successData)
				setCurrentPage(0)
			}
		})
	}

	const deleteLedgerMutation = useDeleteLedgerMutation()
	const onDeleteCallback = (ledger: Ledger) => {
		deleteLedgerMutation.mutate(
			{ id: ledger.id },
			{
				onSuccess: (successData) => {
					toast({
						description: "Ledger deleted",
						duration: 1500
					})

					props.onDelete?.(successData)
				},
				onError: (error) => {
					toast({
						description: error.message,
						variant: "destructive"
					})
				}
			}
		)

		props.onDelete?.(ledger)
	}

	const switchLedgerMutation = useSwitchLedgerMutation()
	const onSelectCallback = (ledger: Ledger, isEditing: boolean) => {
		if (isEditing) {
			setCurrentLedger(ledger)
			setCurrentPage(1)
			return
		}

		if (
			props.shouldUseSelectRequest !== undefined &&
			!props.shouldUseSelectRequest
		) {
			props.onSelect?.(ledger, isEditing)
			return
		}

		switchLedgerMutation.mutate(
			{ id: ledger.id },
			{
				onSuccess: async (data) => {
					if (data === undefined) {
						toast({
							description: "Failed to switch to the specified ledger.",
							variant: "destructive"
						})
						return
					}

					queryClient.invalidateQueries({
						queryKey: USER_SETTINGS_QKEY
					})

					toast({
						description: (
							<>
								Switched to the ledger: <b>{data.ledger?.name}</b>
							</>
						),
						duration: 1500
					})

					props.onSelect?.(ledger, isEditing)
				}
			}
		)
	}

	const Component = [
		<LedgersListPage
			key="ledger-list-page"
			isLoading={ledgersQuery.isLoading}
			isEditMode={isEditMode}
			ledgersList={ledgersQuery.data?.data ?? []}
			currentLedger={settingsQuery.data?.data?.ledger ?? undefined}
			onAddButton={() => {
				setCurrentLedger(undefined)
				setCurrentPage(1)
			}}
			onBackButton={props.onBackButton}
			onDelete={onDeleteCallback}
			onSelect={onSelectCallback}
		/>,
		<LedgerPage
			key="ledger-page"
			isLoading={currenciesQuery.isLoading}
			data={currentLedger}
			currencyList={currenciesQuery.data?.data ?? []}
			onBackButton={() => {
				setCurrentLedger(undefined)
				setIsEditMode(true)
				setCurrentPage(0)
			}}
			onCreate={onCreateCallback}
			onUpdate={onUpdateCallback}
		/>
	]

	return Component[currentPage]
}
