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
export const SMALL_MOBILE_BREKPOINT = 348
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

// Currency symbols mapping
export const CURRENCY_SYMBOLS = {
	AED: "د.إ",
	AFN: "؋",
	ALL: "L",
	AMD: "֏",
	ANG: "ƒ",
	AOA: "Kz",
	ARS: "$",
	AUD: "$",
	AWG: "ƒ",
	AZN: "₼",
	BAM: "KM",
	BBD: "$",
	BDT: "৳",
	BGN: "лв",
	BHD: ".د.ب",
	BIF: "FBu",
	BMD: "$",
	BND: "$",
	BOB: "Bs.",
	BRL: "R$",
	BSD: "$",
	BTN: "Nu.",
	BWP: "P",
	BYN: "Br",
	BZD: "BZ$",
	CAD: "$",
	CDF: "FC",
	CHF: "CHF",
	CLP: "$",
	CNY: "¥",
	COP: "$",
	CRC: "₡",
	CUP: "₱",
	CVE: "$",
	CZK: "Kč",
	DJF: "Fdj",
	DKK: "kr",
	DOP: "RD$",
	DZD: "د.ج",
	EGP: "E£",
	ERN: "Nfk",
	ETB: "Br",
	EUR: "€",
	FJD: "$",
	FKP: "£",
	GBP: "£",
	GEL: "₾",
	GHS: "₵",
	GIP: "£",
	GMD: "D",
	GNF: "FG",
	GTQ: "Q",
	GYD: "$",
	HKD: "$",
	HNL: "L",
	HTG: "G",
	HUF: "Ft",
	IDR: "Rp",
	ILS: "₪",
	INR: "₹",
	IQD: "ع.د",
	IRR: "﷼",
	ISK: "kr",
	JMD: "$",
	JOD: "د.ا",
	JPY: "¥",
	KES: "KSh",
	KGS: "с",
	KHR: "៛",
	KMF: "CF",
	KPW: "₩",
	KRW: "₩",
	KWD: "د.ك",
	KYD: "$",
	KZT: "₸",
	LAK: "₭",
	LBP: "ل.ل",
	LKR: "Rs",
	LRD: "$",
	LSL: "L",
	LYD: "ل.د",
	MAD: "د.م.",
	MDL: "L",
	MGA: "Ar",
	MKD: "ден",
	MMK: "K",
	MNT: "₮",
	MOP: "MOP$",
	MRU: "UM",
	MUR: "₨",
	MVR: "Rf",
	MWK: "MK",
	MXN: "$",
	MYR: "RM",
	MZN: "MT",
	NAD: "$",
	NGN: "₦",
	NIO: "C$",
	NOK: "kr",
	NPR: "₨",
	NZD: "$",
	OMR: "ر.ع.",
	PAB: "B/.",
	PEN: "S/",
	PGK: "K",
	PHP: "₱",
	PKR: "₨",
	PLN: "zł",
	PYG: "₲",
	QAR: "ر.ق",
	RON: "lei",
	RSD: "дин.",
	RUB: "₽",
	RWF: "FRw",
	SAR: "ر.س",
	SBD: "$",
	SCR: "₨",
	SDG: "ج.س.",
	SEK: "kr",
	SGD: "$",
	SHP: "£",
	SLE: "Le",
	SOS: "Sh",
	SRD: "$",
	SSP: "£",
	STN: "Db",
	SYP: "£S",
	SZL: "E",
	THB: "฿",
	TJS: "SM",
	TMT: "m",
	TND: "د.ت",
	TOP: "T$",
	TRY: "₺",
	TTD: "$",
	TWD: "NT$",
	TZS: "TSh",
	UAH: "₴",
	UGX: "USh",
	USD: "$",
	UYU: "$U",
	UZS: "soʻm",
	VED: "Bs.D",
	VES: "Bs.S",
	VND: "₫",
	VUV: "VT",
	WST: "T",
	XAF: "FCFA",
	XCD: "$",
	XOF: "CFA",
	XPF: "₣",
	YER: "﷼",
	ZAR: "R",
	ZMW: "ZK",
	ZWG: "ZiG",

	// Special / fund codes (optional)
	XDR: "SDR",
	XAU: "XAU",
	XAG: "XAG"
} as const
