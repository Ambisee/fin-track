"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup
} from "@/components/ui/field"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { LEDGER_QKEY, SHORT_TOAST_DURATION } from "@/lib/constants"
import { useUpdateLedgerMutation } from "@/lib/mutations"
import { useLedgersQuery, useSettingsQuery, useUserQuery } from "@/lib/queries"
import { supabaseClient } from "@/lib/supabase"
import { Ledger } from "@/types/Ledger"
import { isNonNullable } from "@fintrack/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { ReloadIcon } from "@radix-ui/react-icons"
import { useQueryClient } from "@tanstack/react-query"
import { TriangleAlertIcon } from "lucide-react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import SubSectionTitle from "../SubSectionTitle"

const mailingSectionFormSchema = z.object({
	allowReport: z.boolean()
})

function LedgerRecapList(props: {
	ledgers: Ledger[] | undefined
	includedLedgerIds: Set<number>
	setIncludedLedgerIds: React.Dispatch<React.SetStateAction<Set<number>>>
	isDisabled: boolean
}) {
	const { ledgers, includedLedgerIds, setIncludedLedgerIds, isDisabled } = props

	if (!isNonNullable(ledgers)) {
		return (
			<div className="h-full w-full flex flex-col gap-4 items-center justify-center">
				<TriangleAlertIcon className="stroke-destructive" />
				<p className="text-destructive">Error retrieving available periods.</p>
			</div>
		)
	}

	return (
		<ul>
			{ledgers.map((ledger) => (
				<li
					key={ledger.id}
					className="flex items-center justify-between gap-4 px-4 py-2"
				>
					<div className={`grid min-w-0 ${isDisabled ? "opacity-60" : ""}`}>
						<span className="text-sm truncate">{ledger.name}</span>
						<span className="text-xs text-muted-foreground">
							{ledger.currency.name}
						</span>
					</div>
					<Checkbox
						checked={includedLedgerIds.has(ledger.id)}
						onCheckedChange={(checked) => {
							setIncludedLedgerIds((prev) => {
								const next = new Set(prev)
								if (checked) {
									next.add(ledger.id)
								} else {
									next.delete(ledger.id)
								}
								return next
							})
						}}
						disabled={isDisabled}
					/>
				</li>
			))}
		</ul>
	)
}

export default function AutomaticMonthlyReport() {
	const [isPendingSubmit, setIsPendingSubmit] = useState(false)
	const [supabase] = useState(supabaseClient())

	const userQuery = useUserQuery()
	const userSettingsQuery = useSettingsQuery()
	const ledgersQuery = useLedgersQuery()
	const queryClient = useQueryClient()
	const updateLedgerMutation = useUpdateLedgerMutation()

	const [includedLedgerIds, setIncludedLedgerIds] = useState<Set<number>>(
		() =>
			new Set(
				(ledgersQuery.data ?? [])
					.filter((ledger) => ledger.isInMonthEndRecap)
					.map((ledger) => ledger.id)
			)
	)

	const onFormSubmit = async (
		formData: z.infer<typeof mailingSectionFormSchema>
	) => {
		setIsPendingSubmit(true)
		try {
			if (formData.allowReport && includedLedgerIds.size < 1) {
				throw Error(
					"At least one ledger should be included in the month-end recap."
				)
			}

			const { error } = await supabase
				.from("settings")
				.update({ allow_report: formData.allowReport })
				.eq("user_id", userSettingsQuery.data?.userId as string)

			if (error !== null) {
				throw Error(error.message)
			}

			const changedLedgers = (ledgersQuery.data ?? []).filter(
				(ledger) =>
					includedLedgerIds.has(ledger.id) !== ledger.isInMonthEndRecap
			)

			await Promise.all(
				changedLedgers.map((ledger) =>
					updateLedgerMutation.mutateAsync({
						...ledger,
						isInMonthEndRecap: includedLedgerIds.has(ledger.id)
					})
				)
			)

			await queryClient.invalidateQueries({ queryKey: LEDGER_QKEY })
			toast.info("New settings data saved.", { duration: SHORT_TOAST_DURATION })
		} catch (e) {
			toast.error((e as Error).message, { duration: SHORT_TOAST_DURATION })
		} finally {
			setIsPendingSubmit(false)
		}
	}

	const form = useForm<z.infer<typeof mailingSectionFormSchema>>({
		resolver: zodResolver(mailingSectionFormSchema),
		values: {
			allowReport: userSettingsQuery.data?.allowMonthlyReport ?? false
		}
	})

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault()
				form.handleSubmit(onFormSubmit)()
			}}
		>
			<FieldGroup>
				<Controller
					control={form.control}
					name="allowReport"
					render={({ field, fieldState }) => (
						<Field
							className="flex gap-4 items-center space-y-0"
							data-invalid={fieldState.invalid}
						>
							<div>
								<SubSectionTitle>Automatic Monthly Report</SubSectionTitle>
								<FieldDescription>
									Allow the app to send automatic transaction reports every
									month.
								</FieldDescription>
							</div>
							<div className="w-11">
								{userQuery.isLoading || userSettingsQuery.isLoading ? (
									<Skeleton className="h-6 w-11 rounded-full" />
								) : (
									<Switch
										className="m-0"
										disabled={isPendingSubmit}
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								)}
							</div>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
							<div>
								<p className="text-sm text-muted-foreground mb-2">
									Select which ledgers should appear in the month-end recap
									report.
								</p>
								<div className="relative h-96 rounded-md border overflow-y-auto">
									{ledgersQuery.isLoading ? (
										<ReloadIcon className="absolute top-1/2 left-1/2 translate-[-50%] mr-2 h-4 w-4 animate-spin" />
									) : ledgersQuery.data?.length === 0 ? (
										<p className="text-sm text-muted-foreground flex h-full items-center justify-center p-4">
											No ledgers available.
										</p>
									) : (
										<LedgerRecapList
											ledgers={ledgersQuery.data}
											includedLedgerIds={includedLedgerIds}
											setIncludedLedgerIds={setIncludedLedgerIds}
											isDisabled={!field.value || isPendingSubmit}
										/>
									)}
								</div>
							</div>
						</Field>
					)}
				/>
			</FieldGroup>
			<Button
				className="mt-4"
				disabled={userQuery.isLoading || isPendingSubmit}
			>
				Save Settings
				{isPendingSubmit && (
					<ReloadIcon className="ml-2 h-4 w-4 animate-spin" />
				)}
			</Button>
		</form>
	)
}
