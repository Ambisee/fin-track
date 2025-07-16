import { Entry } from "@/types/supabase"
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { MONTHS } from "./constants"

function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

function isNonNullable<T>(value: T): value is NonNullable<T> {
	return value !== null && value !== undefined
}

function isFunction(value: any): value is Function {
	return typeof value === "function"
}

export { cn, isFunction, isNonNullable }
