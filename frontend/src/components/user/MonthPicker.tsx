import { useToast } from "../ui/use-toast"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogDescription,
	DialogFooter
} from "../ui/dialog"
import { z } from "zod"
import { MONTHS } from "@/lib/constants"
import { Form, FormControl, FormField } from "../ui/form"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectTrigger,
	SelectValue,
	SelectItem
} from "../ui/select"

interface MonthPickerProps {
	value: number[]
	onValueChange: (value: number[]) => void
}

const monthPickerFormSchema = z.object({
	month: z.string(),
	year: z.coerce.number().min(0)
})

export function MonthPicker(props: MonthPickerProps) {
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
