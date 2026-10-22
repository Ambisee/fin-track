import { spawn } from "node:child_process"
import { defineConfig } from "tsdown"

let child = undefined

export default defineConfig({
    entry: ["./src/index.ts"],
    onSuccess: async (config) => {
        if (!config.watch) return

        child?.kill()
        child = spawn("node", ["dist/index.mjs"], { stdio: "inherit" })
    },
    deps: {
        alwaysBundle: ["@fintrack/transaction-report"]
    }
})
