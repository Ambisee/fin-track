import type { SupabaseClient } from "@supabase/supabase-js"
import type { ReportStorage } from "../../domain/ports"

export class SupabaseReportStorage implements ReportStorage {
	constructor(
		private readonly db: SupabaseClient,
		private readonly bucket: string
	) {}

	async put(key: string, data: Uint8Array) {
		const { error } = await this.db.storage
			.from(this.bucket)
			.upload(key, data, { contentType: "application/pdf", upsert: true })
		if (error) throw new Error(`Supabase Storage: upload ${key} failed: ${error.message}`)
	}

	async get(key: string) {
		const { data, error } = await this.db.storage.from(this.bucket).download(key)
		if (error || !data) throw new Error(`Supabase Storage: download ${key} failed: ${error?.message}`)
		return new Uint8Array(await data.arrayBuffer())
	}
}
