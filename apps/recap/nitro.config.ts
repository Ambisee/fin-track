import { defineConfig } from "nitro"

export default defineConfig({
	modules: ["workflow/nitro"],
	routes: { "/**": "./src/index.ts" },
	// @fintrack/transaction-report and @fintrack/types are workspace packages that ship TypeScript/TSX source.
	// Bundle them instead of leaving them as external imports, which Node cannot parse at runtime.
	noExternals: [/^@fintrack\//]
})
