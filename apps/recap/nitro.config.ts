import { defineConfig } from "nitro"
import type { Plugin } from "rolldown"

// TODO: remove when https://github.com/diegomura/react-pdf/issues/3570 is resolved.
const fixPdfkitStandardFonts = (): Plugin => ({
	name: "fix-pdfkit-standard-fonts",
	transform(code, id) {
		const path = id.split("?")[0].replace(/\\/g, "/")
		if (!path.endsWith("/pdfkit/js/pdfkit.node.mjs")) return null

		const re = /require\$1\('#standard-fonts\/([^']+)'\)/g
		const names = new Set<string>()
		for (const m of code.matchAll(re)) names.add(m[1])

		if (names.size === 0) {
			this.warn(
				"No #standard-fonts references found; pdfkit's loading pattern may have changed"
			)
			return null
		}

		const ident = (n: string) => `__pdfkit_${n.replace(/\W/g, "_")}`
		const imports = [...names]
			.map((n) => `import ${ident(n)} from './standard-fonts/${n}.mjs';`)
			.join("\n")

		return {
			code: `${imports}\n${code.replace(re, (_, n) => ident(n))}`,
			map: null
		}
	}
})

export default defineConfig({
	modules: ["workflow/nitro"],
	routes: { "/**": "./src/index.ts" },
	preset: "vercel",
	noExternals: ["pdfkit"],
	builder: "rolldown",
	rolldownConfig: {
		plugins: [fixPdfkitStandardFonts()]
	}
})
