/** Deterministic storage key: re-rendering the same ledger/period overwrites instead of piling up. */
export const reportKey = (periodKey: string, userId: string, ledgerId: string) =>
	`${periodKey}/${userId}/${ledgerId}.pdf`

const slug = (s: string) =>
	s
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 40)

export const reportFileName = (ledgerName: string, periodKey: string) =>
	`fintrack-${periodKey}-${slug(ledgerName) || "ledger"}.pdf`
