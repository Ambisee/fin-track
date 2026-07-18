import { EntryDisplaySettings } from "@/components/user/TimeFilterControlPanel"
import { type ClassValue, clsx } from "clsx"
import { SetStateAction } from "react"
import { twMerge } from "tailwind-merge"
import { DEFAULT_TRUNCATE_MAX_LENGTH } from "./constants"
import { DateHelper, DateRange } from "./helper/DateHelper"

function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

function getUsernameFromEmail(email: string) {
	const atSymbol = email.indexOf("@")
	if (atSymbol === -1) {
		return ""
	}

	const username = email.slice(0, atSymbol)
	return username.replace(/[^a-zA-Z0-9]/g, "")
}

function truncate(
	value: string,
	maxLen: number = DEFAULT_TRUNCATE_MAX_LENGTH,
	lastChar: string = "\u2026"
): string {
	if (value.length < maxLen) return value
	return value.substring(0, maxLen - 1) + lastChar
}

function isNonNullable<T>(value: T): value is NonNullable<T> {
	return value !== null && value !== undefined
}

function isSetStateFunction<T>(
	value: SetStateAction<T>
): value is (prev: T) => T {
	return typeof value === "function"
}

export { cn, getUsernameFromEmail, isNonNullable, isSetStateFunction, truncate }
