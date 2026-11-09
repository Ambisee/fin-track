export type LogLevel = "DEBUG" | "INFO" | "WARNING" | "ERROR"

export interface LogEntry {
	timestamp: string
	level: LogLevel
	context: string
	message: string
	formatted: string
}

export type LogWriter = (entry: LogEntry) => void

export class Logger {
	constructor(private readonly writer?: LogWriter) {}

	format(
		level: LogLevel,
		context: string,
		message: string,
		timestamp = new Date().toISOString()
	): string {
		return `[${timestamp}] [${level}] [${context}] ${message}`
	}

	debug(context: string, message: string): void {
		this.write("DEBUG", context, message)
	}

	info(context: string, message: string): void {
		this.write("INFO", context, message)
	}

	warning(context: string, message: string): void {
		this.write("WARNING", context, message)
	}

	warn(context: string, message: string): void {
		this.warning(context, message)
	}

	error(context: string, message: string): void {
		this.write("ERROR", context, message)
	}

	private write(level: LogLevel, context: string, message: string): void {
		const timestamp = new Date().toISOString()
		const formatted = this.format(level, context, message, timestamp)

		if (this.writer) {
			this.writer({
				timestamp,
				level,
				context,
				message,
				formatted
			})
			return
		}

		switch (level) {
			case "DEBUG":
				console.debug(formatted)
				break
			case "INFO":
				console.info(formatted)
				break
			case "WARNING":
				console.warn(formatted)
				break
			case "ERROR":
				console.error(formatted)
				break
		}
	}
}

export const logger = new Logger()
