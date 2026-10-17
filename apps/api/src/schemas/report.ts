import { z } from "zod"

export const generateReportSchema = z.object({
	ledger_id: z.union([
		z.number().int().positive(),
		z
			.string()
			.regex(/^\d+$/)
			.transform((v) => parseInt(v, 10))
	]),
	time_range: z.object({
		from: z.union([z.string(), z.date()]).transform((val) => new Date(val)),
		to: z.union([z.string(), z.date()]).transform((val) => new Date(val))
	}),
	locale: z.string().optional().default("en-US")
})

export type GenerateReportInput = z.infer<typeof generateReportSchema>
