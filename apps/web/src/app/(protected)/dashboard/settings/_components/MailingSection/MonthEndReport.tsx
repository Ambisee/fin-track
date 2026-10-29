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
import {
	LEDGER_QKEY,
	SHORT_TOAST_DURATION,
	USER_SETTINGS_QKEY
} from "@/lib/constants"
import { useUpdateLedgerMutation } from "@/lib/mutations"
import { useLedgersQuery, useSettingsQuery, useUserQuery } from "@/lib/queries"
import { supabaseClient } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { Ledger } from "@/types/Ledger"
import { isNonNullable } from "@fintrack/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { ReloadIcon } from "@radix-ui/react-icons"
import { useQueryClient } from "@tanstack/react-query"
import { TriangleAlertIcon } from "lucide-react"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import SubSectionTitle from "../SubSectionTitle"

const mailingSectionFormSchema = z.object({
	allowMonthEndReport: z.boolean()
})

type MailingFormSchema = z.infer<typeof mailingSectionFormSchema>

function LedgerRecapList(props: {
	ledgers: Ledger[] | undefined
	includedLedgerIds: Set<number>
	setIncludedLedgerIds: Dispatch<SetStateAction<Set<number>>>
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
						className="size-6"
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

export default function MonthEndReport() {
	const [isPendingSubmit, setIsPendingSubmit] = useState(false)
	const [supabase] = useState(supabaseClient())

	const userQuery = useUserQuery()
	const settingsQuery = useSettingsQuery()
	const ledgersQuery = useLedgersQuery()
	const queryClient = useQueryClient()
	const updateLedgerMutation = useUpdateLedgerMutation()

	const form = useForm<MailingFormSchema>({
		resolver: zodResolver(mailingSectionFormSchema),
		defaultValues: {
			allowMonthEndReport: settingsQuery.data?.allowMonthEndReport ?? false
		}
	})

	const [includedLedgerIds, setIncludedLedgerIds] = useState(new Set<number>())

	const onFormSubmit = async (
		formData: z.infer<typeof mailingSectionFormSchema>
	) => {
		setIsPendingSubmit(true)
		try {
			if (formData.allowMonthEndReport && (includedLedgerIds?.size ?? 0) < 1) {
				throw Error(
					"At least one ledger should be included in the month-end recap."
				)
			}

			const { error } = await supabase
				.from("settings")
				.update({ allow_report: formData.allowMonthEndReport })
				.eq("user_id", settingsQuery.data?.userId as string)

			if (error !== null) {
				throw Error(error.message)
			}

			const changedLedgers = (ledgersQuery.data ?? []).filter(
				(ledger) =>
					includedLedgerIds?.has(ledger.id) !== ledger.isInMonthEndRecap
			)

			await Promise.all(
				changedLedgers.map((ledger) =>
					updateLedgerMutation.mutateAsync({
						...ledger,
						isInMonthEndRecap:
							includedLedgerIds?.has(ledger.id) ?? ledger.isInMonthEndRecap
					})
				)
			)

			await queryClient.invalidateQueries({ queryKey: LEDGER_QKEY })
			await queryClient.invalidateQueries({ queryKey: USER_SETTINGS_QKEY })
			toast.info("New settings data saved.", { duration: SHORT_TOAST_DURATION })
		} catch (e) {
			toast.error((e as Error).message, { duration: SHORT_TOAST_DURATION })
		} finally {
			setIsPendingSubmit(false)
		}
	}

	useEffect(() => {
		if (ledgersQuery.isLoading) return

		const optedIds = ledgersQuery.data
			?.filter((v) => v.isInMonthEndRecap)
			?.map((v) => v.id)

		if (optedIds === undefined) return

		// eslint-disable-next-line react-hooks/set-state-in-effect
		setIncludedLedgerIds(new Set(optedIds))
	}, [ledgersQuery.data, ledgersQuery.isLoading])

	const settingsData = settingsQuery.data
	useEffect(() => {
		const defaultValues: MailingFormSchema = { allowMonthEndReport: false }

		if (!isNonNullable(settingsData)) {
			form.reset(defaultValues)
			return
		}

		defaultValues.allowMonthEndReport = settingsData.allowMonthEndReport
		form.reset(defaultValues)
	}, [form, settingsData])

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
					name="allowMonthEndReport"
					render={({ field, fieldState }) => (
						<Field
							className="flex gap-4 items-center space-y-0"
							data-invalid={fieldState.invalid}
						>
							<div>
								<SubSectionTitle>Month-End Report</SubSectionTitle>
								<FieldDescription>
									Receive a curated recap of your income and expenses in your
									inbox at the end of each month.
								</FieldDescription>
							</div>
							<div className="w-11">
								{userQuery.isLoading || settingsQuery.isLoading ? (
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
							<div
								className={cn(
									"grid transition-[grid-template-rows] duration-300 ease-out",
									field.value ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
								)}
							>
								<div className="overflow-hidden min-h-0">
									<p className="text-sm text-muted-foreground mb-2">
										Select which ledgers should appear in the month-end recap
										report.
									</p>
									<div
										inert={!field.value}
										className="relative h-96 rounded-md border overflow-y-auto"
									>
										{ledgersQuery.isLoading ? (
											<ReloadIcon className="absolute top-1/2 left-1/2 translate-[-50%] mr-2 h-4 w-4 animate-spin" />
										) : ledgersQuery.data?.length === 0 ? (
											<p className="text-sm text-muted-foreground flex h-full items-center justify-center p-4">
												No ledgers available.
											</p>
										) : (
											<LedgerRecapList
												ledgers={ledgersQuery.data}
												includedLedgerIds={includedLedgerIds ?? new Set()}
												setIncludedLedgerIds={setIncludedLedgerIds}
												isDisabled={!field.value || isPendingSubmit}
											/>
										)}
									</div>
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
