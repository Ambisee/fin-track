import { describe, expect, it, vi } from "vitest"
import { Logger, logger, type LogEntry } from "../src/logger"

describe("Logger", () => {
	it("exports a single instance of Logger", () => {
		expect(logger).toBeInstanceOf(Logger)
	})

	it("standardizes message format with timestamp, level, context, and message", () => {
		const customLogger = new Logger()
		const formatted = customLogger.format(
			"INFO",
			"testContext",
			"test message",
			"2026-11-09T00:00:00.000Z"
		)
		expect(formatted).toBe(
			"[2026-11-09T00:00:00.000Z] [INFO] [testContext] test message"
		)
	})

	it("supports custom writer and passes structured entry", () => {
		const entries: LogEntry[] = []
		const customLogger = new Logger((entry) => {
			entries.push(entry)
		})

		customLogger.debug("recapContext", "debug message")
		customLogger.info("recapContext", "info message")
		customLogger.warning("recapContext", "warning message")
		customLogger.error("recapContext", "error message")

		expect(entries).toHaveLength(4)

		expect(entries[0].level).toBe("DEBUG")
		expect(entries[0].context).toBe("recapContext")
		expect(entries[0].message).toBe("debug message")
		expect(entries[0].formatted).toMatch(
			/^\[.+\] \[DEBUG\] \[recapContext\] debug message$/
		)

		expect(entries[1].level).toBe("INFO")
		expect(entries[1].context).toBe("recapContext")
		expect(entries[1].message).toBe("info message")

		expect(entries[2].level).toBe("WARNING")
		expect(entries[2].context).toBe("recapContext")
		expect(entries[2].message).toBe("warning message")

		expect(entries[3].level).toBe("ERROR")
		expect(entries[3].context).toBe("recapContext")
		expect(entries[3].message).toBe("error message")
	})

	it("supports warn alias for warning", () => {
		const entries: LogEntry[] = []
		const customLogger = new Logger((entry) => entries.push(entry))

		customLogger.warn("recapContext", "warn alias message")
		expect(entries).toHaveLength(1)
		expect(entries[0].level).toBe("WARNING")
		expect(entries[0].message).toBe("warn alias message")
	})

	it("delegates to console methods when no writer is provided", () => {
		const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {})
		const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {})
		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {})

		const instance = new Logger()
		instance.debug("ctx", "msg1")
		instance.info("ctx", "msg2")
		instance.warning("ctx", "msg3")
		instance.error("ctx", "msg4")

		expect(debugSpy).toHaveBeenCalledWith(
			expect.stringMatching(/^\[.+\] \[DEBUG\] \[ctx\] msg1$/)
		)
		expect(infoSpy).toHaveBeenCalledWith(
			expect.stringMatching(/^\[.+\] \[INFO\] \[ctx\] msg2$/)
		)
		expect(warnSpy).toHaveBeenCalledWith(
			expect.stringMatching(/^\[.+\] \[WARNING\] \[ctx\] msg3$/)
		)
		expect(errorSpy).toHaveBeenCalledWith(
			expect.stringMatching(/^\[.+\] \[ERROR\] \[ctx\] msg4$/)
		)

		debugSpy.mockRestore()
		infoSpy.mockRestore()
		warnSpy.mockRestore()
		errorSpy.mockRestore()
	})
})
