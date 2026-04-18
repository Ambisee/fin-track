// React Query Keys
export const USER_QKEY = ["user"] as const
export const LEDGER_QKEY = ["ledger"] as const
export const ENTRY_QKEY = ["entryData"] as const
export const STATISTICS_QKEY = ["statistic"] as const
export const USER_SETTINGS_QKEY = ["settings"] as const
export const CATEGORIES_QKEY = ["categories"] as const
export const CURRENCIES_QKEY = ["currencies"] as const
export const MONTH_GROUP_QKEY = ["monthGroup"] as const
export const DOCUMENT_QKEY = ["document"] as const
export const SERVER_PING_QKEY = ["serverPing"] as const

export const QUERY_STALE_TIME = 15 * 60 * 1000
export const PING_QUERY_STALE_TIME = 15 * 60 * 1000

// Server Ping Status
export const SERVER_STATUS = {
	LOADING: -1,
	ONLINE: 0,
	OFFLINE: 1
}

// Transition Components
export const DEFAULT_LABEL = "DEFAULT_LABEL"
export const FORWARD_LABEL = "FORWARD_LABEL"
export const BACKWARD_LABEL = "BACKWARD_LABEL"

export const TRANSITION_ROOT_CLASSNAME = "transition-root"
export const TRANSITION_PAGE_CLASSNAME = "transition-page"

// General Components
export const DESKTOP_BREAKPOINT = 1024
export const MAX_USERNAME_LENGTH = 20

export const LONG_TOAST_DURATION = 2.5 * 1000
export const SHORT_TOAST_DURATION = 1.5 * 1000

export const MONTHS = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December"
]
