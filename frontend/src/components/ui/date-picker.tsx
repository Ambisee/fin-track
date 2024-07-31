"use client"

import {
	SetStateAction,
	Dispatch,
	useState,
	ForwardRefExoticComponent
} from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogOverlay,
	DialogTitle,
	DialogTrigger
} from "@/components/ui/dialog"

interface DatePickerProps {
	value: Date
	onChange: Dispatch<SetStateAction<Date | undefined>>
	closeOnSelect?: boolean
}

export default function DatePicker(props: DatePickerProps) {
	const [isOpen, setIsOpen] = useState(false)

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button
					variant={"outline"}
					className={cn(
						"w-full justify-start text-left font-normal",
						!props.value && "text-muted-foreground"
					)}
				>
					<CalendarIcon className="mr-2 h-4 w-4" />
					{props.value ? format(props.value, "PPP") : <span>Pick a date</span>}
				</Button>
			</DialogTrigger>
			<DialogContent className="w-auto p-4">
				<DialogHeader>
					<DialogTitle>Pick a date</DialogTitle>
					<DialogDescription asChild>
						<Calendar
							defaultMonth={props.value}
							mode="single"
							selected={props.value}
							onSelect={(e) => {
								props.onChange(e)
								if (props.closeOnSelect === true) {
									setIsOpen(false)
								}
							}}
							initialFocus
						/>
					</DialogDescription>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	)
}
