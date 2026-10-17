import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons"
import React, { ComponentProps, useState } from "react"
import { Input } from "../ui/input"

const PasswordField = React.forwardRef<
	HTMLInputElement,
	ComponentProps<"input">
>(({ className, onFocus, onBlur, ...props }, ref) => {
	const [focused, setFocused] = useState(false)
	const [showPassword, setShowPassword] = useState(false)

	return (
		<div
			className={cn(
				"flex h-10 w-full rounded-md border border-input bg-transparent text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
				focused ? "outline-none ring-1 ring-ring" : undefined,
				className
			)}
		>
			<input
				type={showPassword ? "text" : "password"}
				onFocus={(e) => {
					onFocus?.(e)
					setFocused(true)
				}}
				onBlur={(e) => {
					onBlur?.(e)
					setFocused(false)
				}}
				className="w-full px-3 py-1 focus:outline-none "
				ref={ref}
				{...props}
			/>
			<Button
				className="h-full"
				variant="ghost"
				type="button"
				onClick={(e) => {
					e.preventDefault()
					setShowPassword((c) => !c)
				}}
			>
				{showPassword ? (
					<EyeClosedIcon width={16} height={16} />
				) : (
					<EyeOpenIcon width={16} height={16} />
				)}
			</Button>
		</div>
	)
})

PasswordField.displayName = "PasswordField"

export default PasswordField
