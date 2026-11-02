import { loadConfig, type AppConfig } from "./config"
import type {
	Source,
	Mailer,
	RecapLog,
	ReportRenderer,
	ReportStorage
} from "./domain/ports"
import { ReactPdfRenderer } from "./adapters/react-pdf/renderer"

export interface Container {
	config: AppConfig
	source: Source
	log: RecapLog
	storage: ReportStorage
	mailer: Mailer
	renderer: ReportRenderer
}

let cached: Container | undefined

/** Composition root. Steps call this instead of importing adapters, so adapters stay swappable. */
export async function getContainer(): Promise<Container> {
	if (cached) return cached
	const config = loadConfig()
	const renderer = new ReactPdfRenderer()

	if (config.adapters === "memory") {
		const { createMemoryAdapters, simulateRenderFailures } =
			await import("./adapters/memory")
		cached = {
			config,
			renderer: simulateRenderFailures(renderer),
			...createMemoryAdapters()
		}
		return cached
	}

	const [{ createSupabaseAdapters }, { createGmailMailer }] = await Promise.all(
		[import("./adapters/supabase"), import("./adapters/nodemailer/mailer")]
	)
	cached = {
		config,
		renderer,
		...createSupabaseAdapters(config),
		mailer: createGmailMailer(config)
	}
	return cached
}

/** Test seam. */
export function setContainerForTests(c: Container | undefined) {
	cached = c
}
