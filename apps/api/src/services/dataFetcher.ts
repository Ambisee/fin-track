import dotenv from "dotenv"
import { createClient, SupabaseClient } from "@supabase/supabase-js"
import type { Database, EntryRow } from "@fintrack/types"

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_KEY || ""

export const supabase: SupabaseClient<Database> = createClient<Database>(
	supabaseUrl,
	supabaseKey,
	{
		auth: {
			persistSession: false,
			autoRefreshToken: false
		}
	}
)

export interface UserProfile {
	id: string
	email: string
	username: string
	current_ledger: number | null
	allow_report: boolean
}

export interface LedgerDetails {
	id: number
	name: string
	currency_name: string
}

export interface UserDataFetchParams {
	uid: string
	ledgerId: number
}

export interface DataFetcherService {
	getUser: (uid: string) => Promise<UserProfile | null>
	getLedger: (uid: string, ledgerId: number) => Promise<LedgerDetails | null>
	getUsersWithReportEnabled: () => Promise<UserProfile[]>
	getEntriesForPeriod: (
		uid: string,
		ledgerId: number,
		from: Date,
		to: Date
	) => Promise<EntryRow[]>
}

export class SupabaseDataFetcherService implements DataFetcherService {
	async getUser(uid: string): Promise<UserProfile | null> {
		const { data: authUser, error: authError } =
			await supabase.auth.admin.getUserById(uid)
		if (authError || !authUser.user) {
			return null
		}

		const { data: settings } = await supabase
			.from("settings")
			.select("allow_report, current_ledger")
			.eq("user_id", uid)
			.single()

		const username =
			authUser.user.user_metadata?.username ||
			authUser.user.email?.split("@")[0] ||
			"User"

		return {
			id: authUser.user.id,
			email: authUser.user.email || "",
			username,
			current_ledger: settings?.current_ledger ?? null,
			allow_report: settings?.allow_report ?? false
		}
	}

	async getLedger(
		uid: string,
		ledgerId: number
	): Promise<LedgerDetails | null> {
		const { data, error } = await supabase
			.from("ledger")
			.select("id, name, currency (currency_name)")
			.eq("id", ledgerId)
			.eq("created_by", uid)
			.single()

		if (error || !data) {
			return null
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const currency = data.currency as any
		const currency_name = currency?.currency_name || "USD"

		return {
			id: data.id,
			name: data.name,
			currency_name
		}
	}

	async getEntriesForPeriod(
		uid: string,
		ledgerId: number,
		from: Date,
		to: Date
	): Promise<EntryRow[]> {
		const fromStr = from.toISOString().split("T")[0]
		const toStr = to.toISOString().split("T")[0]

		const { data, error } = await supabase
			.from("entry")
			.select("*")
			.eq("created_by", uid)
			.eq("ledger", ledgerId)
			.gte("date", fromStr)
			.lte("date", toStr)
			.order("date", { ascending: true })

		if (error || !data) {
			return []
		}

		return data
	}

	async getUsersWithReportEnabled(): Promise<UserProfile[]> {
		const { data, error } = await supabase
			.from("user_view")
			.select("*")
			.eq("allow_report", true)

		if (error || !data) {
			return []
		}

		return data.map((item: any) => ({
			id: item.id,
			email: item.email || "",
			username: item.username || item.email?.split("@")[0] || "User",
			current_ledger: item.current_ledger,
			allow_report: item.allow_report === true
		}))
	}
}
