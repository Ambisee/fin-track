"use client"

import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from "@/components/ui/dialog"
import { Form, FormControl, FormField } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import EntryList from "@/components/user/EntryList"
import { MONTHS } from "@/lib/constants"
import { useEntryDataQuery } from "@/lib/hooks"
import { filterDataGroup } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronLeft, ChevronRight, SearchIcon } from "lucide-react"
import { SearchResult } from "minisearch"
import { useContext, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { DashboardContext } from "../layout"

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
									props.onValueChange([
										MONTHS.indexOf(formData.month),
										formData.year
									])
									setOpen(false)
								},
								(error) => {
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
	const { search } = useContext(DashboardContext)
	const [curPeriod, setCurPeriod] = useState<number[]>(() => {
		const today = new Date()
		return [today.getMonth(), today.getFullYear()]
	})
	const [searchQuery, setSearchQuery] = useState<string>("")
	const [searchResult, setSearchResult] = useState<SearchResult[] | null>(null)
	const [_, startTransition] = useTransition()
	const { dataGroups } = useContext(DashboardContext)

	const entryQuery = useEntryDataQuery()

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
				{data.length > 0 ? (
					<EntryList data={data} />
				) : (
					<div className="h-full grid gap-4 items-center justify-center">
						<p>No matching entries found.</p>
					</div>
				)}
			</div>
		)
	}

	const renderEntries = () => {
		if (entryQuery.isLoading || !entryQuery.data?.data) {
			return (
				<div className="mb-8">
					<div className="w-full flex justify-between items-center pt-2 pb-4">
						<Skeleton className="w-12 h-12 rounded-full" />
						<Skeleton className="w-36 h-12" />
						<Skeleton className="w-12 h-12 rounded-full" />
					</div>
					<Skeleton className="w-full h-[6.25rem] mb-4" />
					<Skeleton className="w-full h-[6.25rem] mb-4" />
				</div>
			)
		}

		const currentGroup = filterDataGroup(curPeriod[0], curPeriod[1], dataGroups)

		return (
			<div className="mb-8">
				<div className="flex justify-between items-center pb-4 pt-2 bg-background">
					<Button
						className="w-12 h-12 rounded-full"
						variant="ghost"
						onClick={() =>
							setCurPeriod((c) => {
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
				<EntryList data={currentGroup.data.toReversed()} />
			</div>
		)
	}

	return (
		<div>
			<div className="w-full mb-4 flex justify-between items-center">
				<h1 className="text-3xl">Entries</h1>
			</div>
			<div className="sticky top-0 py-4 bg-background">
				<SearchIcon className="absolute top-1/2 translate-y-[-50%] left-5 translate-x-[-50%] w-4 h-4 stroke-muted-foreground pointer-events-none" />
				<Input
					disabled={entryQuery.isLoading || !entryQuery.data?.data}
					type="search"
					className="pl-10"
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
