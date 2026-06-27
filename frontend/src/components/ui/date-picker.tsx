"use client"

import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Dispatch, SetStateAction, useState } from "react"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from "./dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

interface DatePickerProps {
	value: Date
	required?: boolean
	disabled?: boolean
	onChange: Dispatch<SetStateAction<Date>>
	closeOnSelect?: boolean
}

export function DatePicker(props: DatePickerProps) {
	const [isOpen, setIsOpen] = useState(false)

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					id="date-picker-simple"
					className="justify-start font-medium text-md text-muted-foreground"
				>
					{format(props.value, "PPP")}
				</Button>
			</DialogTrigger>
			<DialogContent
				className="max-w-screen w-auto max-h-screen p-0 rounded-lg overflow-clip"
				hideCloseButton
			>
				<DialogHeader className="pt-4">
					<DialogTitle>Pick a Date</DialogTitle>
				</DialogHeader>
				<Calendar
					required
					mode="single"
					classNames={{
						weeks: "h-[calc(6*(var(--cell-size)+8px))]"
					}}
					defaultMonth={props.value}
					selected={props.value}
					onSelect={(e: SetStateAction<Date>) => {
						props.onChange(e)
						if (props.closeOnSelect === true) {
							setIsOpen(false)
						}
					}}
				/>
			</DialogContent>
		</Dialog>
	)
}
