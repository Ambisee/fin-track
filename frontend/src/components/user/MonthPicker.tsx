import { MONTHS } from "@/lib/constants"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "../ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from "../ui/dialog"
import { Input } from "../ui/input"
import { Controller } from "react-hook-form"
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field"
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue
} from "../ui/select"
import { toast } from "sonner"

interface MonthPickerProps {
	value: Date
	onValueChange: (value: Date) => void
}

const monthPickerFormSchema = z.object({
	month: z.string(),
	year: z.coerce.number().min(0)
})

export default function MonthPicker(props: MonthPickerProps) {
	const [open, setOpen] = useState(false)

	const form = useForm<z.infer<typeof monthPickerFormSchema>>({
		resolver: zodResolver(monthPickerFormSchema),
		defaultValues: {
			month: MONTHS[props.value.getMonth()],
			year: props.value.getFullYear()
		}
	})

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent onCloseAutoFocus={(e) => e.preventDefault()}>
				<form
					onSubmit={(e) => {
						e.preventDefault()
						form.handleSubmit(
							(formData) => {
								const value = new Date()
								value.setDate(1)
								value.setMonth(MONTHS.indexOf(formData.month))
								value.setFullYear(formData.year)

								props.onValueChange(value)
								setOpen(false)
							},
							(error) => {
								toast.error(
									<div>
										{error.month?.message && <p>{error.month.message}</p>}
										{error.year?.message && <p>{error.year.message}</p>}
									</div>
								)
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
					<FieldGroup>
						<div className="w-full my-4 flex items-center justify-between gap-4">
							<Controller
								control={form.control}
								name="month"
								render={({ field, fieldState }) => (
									<Field className="flex-1" data-invalid={fieldState.invalid}>
										<FieldLabel className="sr-only">Month</FieldLabel>
										<Select
											defaultValue={field.value}
											onValueChange={field.onChange}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select a month..." />
											</SelectTrigger>
											<SelectContent className="max-h-60">
												<SelectGroup>
													{MONTHS.map((value) => {
														return (
															<SelectItem key={value} value={value}>
																{value}
															</SelectItem>
														)
													})}
												</SelectGroup>
											</SelectContent>
										</Select>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								)}
							/>
							<Controller
								control={form.control}
								name="year"
								render={({ field, fieldState }) => (
									<Field className="w-24" data-invalid={fieldState.invalid}>
										<FieldLabel className="sr-only">Year</FieldLabel>
										<Input inputMode="numeric" {...field} />
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								)}
							/>
						</div>
					</FieldGroup>
					<DialogFooter>
						<Button className="w-full">Update</Button>
					</DialogFooter>
				</form>
			</DialogContent>
			<Button
				className="w-12 h-12 rounded-full"
				variant="ghost"
				onClick={() => {
					const result = new Date(props.value)
					result.setMonth(result.getMonth() - 1)
					props.onValueChange(result)
				}}
			>
				<ChevronLeft className="w-4 h-4" />
			</Button>
			<DialogTrigger asChild>
				<Button variant="ghost" className="text-lg" onClick={() => {}} asChild>
					<h2 className="text-lg hover:cursor-pointer">
						{MONTHS[props.value.getMonth()]} {props.value.getFullYear()}
					</h2>
				</Button>
			</DialogTrigger>
			<Button
				className="h-12 w-12 rounded-full"
				variant="ghost"
				onClick={() => {
					const result = new Date(props.value)
					result.setMonth(result.getMonth() + 1)
					props.onValueChange(result)
				}}
			>
				<ChevronRight className="w-4 h-4" />
			</Button>
		</Dialog>
	)
}
