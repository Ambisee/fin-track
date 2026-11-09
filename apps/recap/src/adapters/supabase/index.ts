import { createClient } from "@supabase/supabase-js"
import type { AppConfig } from "../../config"
import { SupabaseSource } from "./source"
import { SupabaseRecapLog } from "./log"
import { SupabaseReportStorage } from "./storage"
import type { Database } from "@fintrack/types"

export function createSupabaseAdapters(config: AppConfig) {
	// Service-role key: bypasses RLS. Server-side only, never ship it to a client.
	const db = createClient<Database, "public", "public">(
		config.supabaseUrl,
		config.supabaseServiceRoleKey,
		{
			auth: { persistSession: false, autoRefreshToken: false }
		}
	)

	const workflowDb = createClient<Database, "workflow", "workflow">(
		config.supabaseUrl,
		config.supabaseServiceRoleKey,
		{
			auth: { persistSession: false, autoRefreshToken: false },
			db: { schema: "workflow" }
		}
	)

	return {
		source: new SupabaseSource(db),
		log: new SupabaseRecapLog(workflowDb),
		storage: new SupabaseReportStorage(db, config.reportBucket)
	}
}
