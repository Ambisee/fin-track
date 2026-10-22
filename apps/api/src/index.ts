import { serve } from "@hono/node-server"
import dotenv from "dotenv"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { cronRouter } from "./routes/cron"
import { reportsRouter } from "./routes/reports"
import { LoggerImpl, type Logger } from "./services/log"
import { showRoutes } from "hono/dev"

export const app = new Hono()

const appLogger: Logger = new LoggerImpl()
const isDebug = () => process.env.DEBUG?.toLowerCase() === "true"

if (isDebug()) {
	appLogger.info("index", "Environment variables loaded.")
	dotenv.config()
}

// Global middlewares
app.use("*", logger())
app.use(
	"*",
	cors({
		origin: (origin) => {
			const frontendUrl = process.env.FRONTEND_URL
			if (
				!frontendUrl ||
				origin === frontendUrl ||
				origin.startsWith("http://localhost") ||
				origin.startsWith("http://192.168.") ||
				origin.startsWith("http://127.0.0.1")
			) {
				return origin || "*"
			}
			return frontendUrl
		},
		allowHeaders: ["Authorization", "Content-Type", "X-ADMIN-PASSWORD"],
		allowMethods: ["GET", "POST", "OPTIONS"]
	})
)

// Health check endpoints
app.get("/", (c) =>
	c.json({
		service: "FinTrack API"
	})
)

app.get("/api/ping", (c) =>
	c.json({
		status: "Online",
		timestamp: new Date().toISOString()
	})
)

// Mount routers
if (process.env.INCLUDE_REPORTS_ROUTER) {
	app.route("/api/reports", reportsRouter)
	appLogger.info("index", "Reports Router added.")
}

if (process.env.INCLUDE_CRON_ROUTER) {
	app.route("/api/cron", cronRouter)
	appLogger.info("index", "Cron Router added.")
}

// Global error handler
app.onError((err, c) => {
	appLogger.error("API Error", err)
	return c.json(
		{
			error: err.message || "Internal server error"
		},
		500
	)
})

const hostname = process.env.HOST || "localhost"
const port = Number(process.env.PORT) || 8000

serve(
	{
		fetch: app.fetch,
		hostname,
		port
	},
	() => {
		appLogger.info("index", `Show Routes:`)
		if (isDebug()) {
			showRoutes(app)
		}

		appLogger.info(
			"index",
			`FinTrack API listening on http://${hostname}:${port}`
		)
	}
)

export default app
