import {
	LEDGER_QKEY,
	SHORT_TOAST_DURATION,
	USER_SETTINGS_QKEY
} from "@/lib/constants"
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
import { Ledger } from "@/types/supabase"
import { PostgrestError } from "@supabase/supabase-js"
import { useIsMutating, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useToast } from "../ui/use-toast"
import LedgerPage, { LedgerFormData, LedgerPageProps } from "./LedgerPage"
import LedgersListPage, { LedgersListPageProps } from "./LedgersListPage"
import { isNonNullable } from "@/lib/utils"

interface LedgerGroupProps
	extends Omit<
		LedgersListPageProps & LedgerPageProps,
		| "onCreate"
		| "onUpdate"
		| "onDelete"
		| "onSelect"
		| "onAddButton"
		| "currencyList"
		| "ledgersList"
		| "isLoading"
		| "data"
	> {
	/**
	 * Set this flag to `false` to directly call the `props.onSelect`
	 * callback, skipping the HTTP request to switch the current ledger.
	 */
	shouldUseSelectRequest?: boolean

	onDelete?: (ledger: Ledger) => void
	onSelect?: (ledger: Ledger, isEditing: boolean) => void
	onCreate?: (ledger: LedgerFormData) => void
	onUpdate?: (ledger: LedgerFormData) => void
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

	const isLedgerMutating = useIsMutating({ mutationKey: LEDGER_QKEY })
	const isSettingsMutating = useIsMutating({ mutationKey: USER_SETTINGS_QKEY })

	const insertLedgerMutation = useInsertLedgerMutation()
	const onCreateCallback = async (ledger: LedgerFormData) => {
		const userID = userQuery.data?.id
		if (!userID) {
			toast({ description: "No user ID found" })
			return
		}

		const payload: Parameters<typeof insertLedgerMutation.mutate>[0] = {
			...ledger,
			created_by: userID
		}

		try {
			const successData = await insertLedgerMutation.mutateAsync(payload)
			if (!isNonNullable(successData)) {
				throw Error("An unexpected error occured: Inserted entry is null")
			}

			toast({
				description: "New ledger created",
				duration: SHORT_TOAST_DURATION
			})

			await queryClient.invalidateQueries({ queryKey: LEDGER_QKEY })
			props.onCreate?.(successData)
			setCurrentPage(0)
		} catch (e) {
			const errorData = e as Error

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
		}

		return
	}

	const updateLedgerMutation = useUpdateLedgerMutation()
	const onUpdateCallback = async (ledger: LedgerFormData) => {
		const userID = userQuery.data?.id
		if (!userID) {
			toast({ description: "No user ID found" })
			return
		}

		const payload: Parameters<typeof updateLedgerMutation.mutate>[0] = {
			...ledger,
			created_by: userID
		}

		try {
			const successData = await updateLedgerMutation.mutateAsync(payload)
			if (!isNonNullable(successData)) {
				throw Error("An unexpected error occured: Inserted entry is null")
			}

			toast({
				description: "Ledger updated",
				duration: SHORT_TOAST_DURATION
			})

			await queryClient.invalidateQueries({ queryKey: LEDGER_QKEY })
			props.onUpdate?.(successData)
			setCurrentPage(0)
		} catch (e) {
			const errorData = e as Error

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
		}

		return
	}

	const deleteLedgerMutation = useDeleteLedgerMutation()
	const onDeleteCallback = async (ledger: Ledger) => {
		try {
			const successData = await deleteLedgerMutation.mutateAsync({
				id: ledger.id
			})
			if (!isNonNullable(successData)) {
				throw Error("An unexpected error occured: Inserted entry is null")
			}

			toast({
				description: "Ledger deleted",
				duration: SHORT_TOAST_DURATION
			})

			await queryClient.invalidateQueries({ queryKey: LEDGER_QKEY })
			props.onDelete?.(successData)
		} catch (e) {
			const errorData = e as Error

			toast({
				description: errorData.message,
				variant: "destructive"
			})
		}
	}

	const switchLedgerMutation = useSwitchLedgerMutation()
	const onSelectCallback = async (ledger: Ledger, isEditing: boolean) => {
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

		try {
			const successData = await switchLedgerMutation.mutateAsync({
				id: ledger.id
			})
			if (successData === undefined) {
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
						Switched to the ledger: <b>{successData?.ledger?.name}</b>
					</>
				),
				duration: SHORT_TOAST_DURATION
			})

			props.onSelect?.(ledger, isEditing)
		} catch (e) {
			const errorData = e as Error

			toast({
				description: errorData.message,
				variant: "destructive"
			})
		}
	}

	const isLoading =
		isLedgerMutating > 0 ||
		isSettingsMutating > 0 ||
		ledgersQuery.isFetching ||
		settingsQuery.isFetching

	const Component = [
		<LedgersListPage
			key="ledger-list-page"
			isLoading={isLoading}
			isInitialized={!ledgersQuery.isLoading}
			isEditMode={isEditMode}
			ledgersList={ledgersQuery.data ?? []}
			currentLedger={settingsQuery.data?.ledger ?? undefined}
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
			isLoading={isLoading}
			isInitialized={!ledgersQuery.isLoading && !currenciesQuery.isLoading}
			data={currentLedger}
			currencyList={currenciesQuery.data ?? []}
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
