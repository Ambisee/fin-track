"use client"

import { cn } from "@/lib/utils"
import {
	CommandItem,
	CommandGroup,
	Command,
	CommandInput,
	CommandEmpty,
	CommandList
} from "./command"
import { Popover, PopoverTrigger, PopoverContent } from "./popover"
import { Button } from "./button"
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons"
import { useState } from "react"

interface ComboBoxProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
	values: { value: string; label: string }[]
	onChange: (e: string) => void
	closeOnSelect?: boolean
}

export default function ComboBox(props: ComboBoxProps) {
	const [isOpen, setIsOpen] = useState(false)

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					disabled={props.disabled}
					variant="outline"
					role="combobox"
					className={cn(
						"w-[200px] justify-between",
						!props.value && "text-muted-foreground"
					)}
				>
					{props.value ? props.value : "Select a value"}
					<CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0">
				<Command>
					<CommandInput placeholder="Select type..." className="h-9" />
					<CommandList>
						<CommandEmpty>No value found.</CommandEmpty>
						<CommandGroup>
							{props.values.map((val) => (
								<CommandItem
									value={val.value}
									key={val.value}
									onSelect={(e) => {
										props.onChange(e)
										if (props.closeOnSelect) {
											setIsOpen(false)
										}
									}}
								>
									{val.label}
									<CheckIcon
										className={cn(
											"ml-auto h-4 w-4",
											val.value === props.value ? "opacity-100" : "opacity-0"
										)}
									/>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	)
}
