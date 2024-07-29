import React, {
	useState,
	RefAttributes,
	ForwardRefExoticComponent
} from "react"
import { type InputProps } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { EyeOpenIcon, EyeNoneIcon, EyeClosedIcon } from "@radix-ui/react-icons"
import { cn } from "@/lib/utils"

const PasswordField = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, onFocus, onBlur, type, ...props }, ref) => {
		const [focused, setFocused] = useState(false)
		const [showPassword, setShowPassword] = useState(false)

		return (
			<div
				className={cn(
					`flex h-10 w-full rounded-md border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground ${
						focused ? "outline-none ring-2 ring-ring ring-offset-2" : ""
					} disabled:cursor-not-allowed disabled:opacity-50`,
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
					className={cn(
						`flex w-full px-3 py-2 rounded-md bg-background text-base ring-offset-background file:border-0 file:bg-transparent border-none outline-none file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50`,
						className
					)}
					ref={ref}
					{...props}
				/>
				<Button
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
	}
)

PasswordField.displayName = "PasswordField"

export default PasswordField
