import { SetStateAction } from "react"

export function isNonNullable<T>(value: T): value is NonNullable<T> {
	return value !== null && value !== undefined
}

export function isSetStateFunction<T>(
	value: SetStateAction<T>
): value is (prev: T) => T {
	return typeof value === "function"
}
