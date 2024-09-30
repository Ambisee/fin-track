"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import EntryList from "@/components/user/EntryList"
import { useEntryDataQuery } from "@/lib/hooks"
import { getDataGroup, sortDataByDateGroup } from "@/lib/utils"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { useContext, useEffect, useMemo, useState, useTransition } from "react"
import { DashboardContext } from "../layout"
import { SearchResult } from "minisearch"
import { MONTHS } from "@/lib/constants"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from "@/components/ui/dialog"
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue
} from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField } from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"
import { ReloadIcon } from "@radix-ui/react-icons"

interface MonthPickerProps {
	value: number[]
	onValueChange: (value: number[]) => void
}

const monthPickerFormSchema = z.object({
	month: z.string(),
	year: z.coerce.number().min(0)
})

function MonthPicker(props: MonthPickerProps) {
	const { toast } = useToast()
	const [open, setOpen] = useState(false)

	const form = useForm<z.infer<typeof monthPickerFormSchema>>({
		resolver: zodResolver(monthPickerFormSchema),
		defaultValues: {
			month: MONTHS[props.value[0]],
			year: props.value[1]
		}
	})

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent onCloseAutoFocus={(e) => e.preventDefault()}>
				<Form {...form}>
					<form
						onSubmit={(e) => {
							e.preventDefault()
							form.handleSubmit(
								(formData) => {
									console.log("suc")
									props.onValueChange([
										MONTHS.indexOf(formData.month),
										formData.year
									])
									setOpen(false)
								},
								(error) => {
									console.log("err")
									toast({
										variant: "destructive",
										description: (
											<div>
												{error.month?.message && <p>{error.month.message}</p>}
												{error.year?.message && <p>{error.year.message}</p>}
											</div>
										)
									})
								}
							)()
						}}
					>
						<DialogHeader>
							<DialogTitle>Select a month</DialogTitle>
							<DialogDescription>
								Specify a month to view its data
							</DialogDescription>
						</DialogHeader>
						<div className="w-full my-4 flex items-center justify-between gap-4">
							<FormField
								control={form.control}
								name="month"
								render={({ field }) => (
									<FormControl>
										<Select
											defaultValue={field.value}
											onValueChange={field.onChange}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select a month..." />
											</SelectTrigger>
											<SelectContent className="max-h-60">
												<SelectGroup>
													{MONTHS.map((value, index) => {
														return (
															<SelectItem key={value} value={value}>
																{value}
															</SelectItem>
														)
													})}
												</SelectGroup>
											</SelectContent>
										</Select>
									</FormControl>
								)}
							/>
							<FormField
								control={form.control}
								name="year"
								render={({ field }) => (
									<FormControl>
										<Input inputMode="numeric" {...field} />
									</FormControl>
								)}
							/>
						</div>
						<DialogFooter>
							<Button className="w-full">Update</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
			<DialogTrigger asChild>
				<Button variant="ghost" className="text-lg" onClick={() => {}} asChild>
					<h3 className="text-lg hover:cursor-pointer">
						{MONTHS[props.value[0]]} {props.value[1]}
					</h3>
				</Button>
			</DialogTrigger>
		</Dialog>
	)
}

export default function DashboardEntries() {
	const [curPeriod, setCurPeriod] = useState<number[] | undefined>(undefined)
	const [searchQuery, setSearchQuery] = useState<string>("")
	const [searchResult, setSearchResult] = useState<SearchResult[] | null>(null)
	const [isPending, startTransition] = useTransition()
	const { search } = useContext(DashboardContext)

	const entryQuery = useEntryDataQuery()

	const dataGroups = useMemo(() => {
		if (entryQuery.isLoading) {
			return []
		}

		if (entryQuery.data === undefined || entryQuery.data.data === null) {
			return []
		}

		const result = sortDataByDateGroup(entryQuery.data.data)
		if (result.length < 1) {
			const d = new Date()
			return [
				{
					month: MONTHS[d.getMonth()],
					year: d.getFullYear(),
					data: []
				}
			]
		}

		return result
	}, [entryQuery.data, entryQuery.isLoading])

	const renderSearchResult = () => {
		if (
			entryQuery.isLoading ||
			!entryQuery.data?.data ||
			searchResult === null
		) {
			return []
		}

		const data = []
		for (const value of searchResult) {
			data.push(entryQuery.data.data[value.id])
		}

		return (
			<div className="mt-14">
				<EntryList data={data} />
			</div>
		)
	}

	const renderEntries = () => {
		if (
			curPeriod === undefined ||
			entryQuery.isLoading ||
			!entryQuery.data?.data
		) {
			return (
				<div className="mb-8">
					<div className="w-full flex justify-between items-center mb-4 pb-4">
						<Skeleton className="w-12 h-12 rounded-full" />
						<Skeleton className="w-36 h-12" />
						<Skeleton className="w-12 h-12 rounded-full" />
					</div>
					<Skeleton className="w-full h-[6.25rem] mb-4" />
					<Skeleton className="w-full h-[6.25rem] mb-4" />
				</div>
			)
		}

		const currentGroup = getDataGroup(curPeriod[0], curPeriod[1], dataGroups)

		return (
			<div className="mb-8">
				<div className="flex justify-between items-center pb-4 bg-background">
					<Button
						className="w-12 h-12 rounded-full"
						variant="ghost"
						onClick={() =>
							setCurPeriod((c) => {
								if (c === undefined) return

								const result = [c[0] - 1, c[1]]
								if (result[0] < 0) {
									result[0] = 11
									result[1] -= 1
								}

								return result
							})
						}
					>
						<ChevronLeft className="w-4 h-4" />
					</Button>
					<MonthPicker
						key={`${curPeriod[0]}-${curPeriod[1]}`}
						value={curPeriod}
						onValueChange={(value) => {
							setCurPeriod(value)
						}}
					/>
					<Button
						className="h-12 w-12 rounded-full"
						variant="ghost"
						onClick={() =>
							setCurPeriod((c) => {
								if (c === undefined) return

								const result = [c[0] + 1, c[1]]
								result[1] += Math.floor(result[0] / 12)
								result[0] = result[0] % 12

								return result
							})
						}
					>
						<ChevronRight className="w-4 h-4" />
					</Button>
				</div>
				{currentGroup.data.length === 0 ? (
					<div>No entries available for this period.</div>
				) : (
					<EntryList data={currentGroup.data} />
				)}
			</div>
		)
	}

	useEffect(() => {
		if (curPeriod === undefined) {
			const today = new Date()
			setCurPeriod([today.getMonth(), today.getFullYear()])
		}
	}, [curPeriod])

	return (
		<div>
			<h1 className="text-2xl">Entries</h1>
			<div className="sticky top-0 py-4 bg-background">
				<Input
					placeholder="Search for an entry..."
					value={searchQuery}
					onChange={(e) => {
						setSearchQuery(e.target.value)
						if (e.target.value === "") {
							setSearchResult(null)
							return
						}

						startTransition(() => {
							setSearchResult(search.search(e.target.value, { prefix: true }))
						})
					}}
				/>
			</div>
			{searchQuery !== "" ? renderSearchResult() : renderEntries()}
		</div>
	)
}
