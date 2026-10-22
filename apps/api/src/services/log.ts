export interface Logger {
	debug: (ctx: string, ...messages: unknown[]) => void
	info: (ctx: string, ...messages: unknown[]) => void
	warn: (ctx: string, ...messages: unknown[]) => void
	error: (ctx: string, ...messages: unknown[]) => void
}

export class LoggerImpl implements Logger {
	debug(ctx: string, ...messages: unknown[]) {
		console.debug(`[${ctx}]`, ...messages)
	}

	info(ctx: string, ...messages: unknown[]) {
		console.info(`[${ctx}]`, ...messages)
	}

	warn(ctx: string, ...messages: unknown[]) {
		console.warn(`[${ctx}]`, ...messages)
	}

	error(ctx: string, ...messages: unknown[]) {
		console.error(`[${ctx}]`, ...messages)
	}
}

const logger: Logger = new LoggerImpl()
export { logger }
