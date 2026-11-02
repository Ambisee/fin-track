import type { LedgerInfo, RecapUser } from "./types"

export const DEFAULT_LOCALE = "en-US"

export const localeOf = (user: Pick<RecapUser, "locale">): string =>
	user.locale || DEFAULT_LOCALE
