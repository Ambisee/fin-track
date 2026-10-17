import { serve } from "@hono/node-server"
import dotenv from "dotenv"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
// import { cronRouter } from "./routes/cron"
import { reportsRouter } from "./routes/reports"

dotenv.config()

export const app = new Hono()

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
		service: "FinTrack API",
		status: "healthy",
		version: "1.0.0"
	})
)

app.get("/api/ping", (c) =>
	c.json({
		status: "online",
		timestamp: new Date().toISOString()
	})
)

// Mount routers
app.route("/api/reports", reportsRouter)
// app.route("/api/cron", cronRouter)

// Global error handler
app.onError((err, c) => {
	console.error("[API Error]", err)
	return c.json(
		{
			error: err.message || "Internal server error"
		},
		500
	)
})

const port = Number(process.env.PORT) || 8000

if (process.env.NODE_ENV !== "test") {
	console.log(`Starting FinTrack API on port ${port}...`)
	serve({
		fetch: app.fetch,
		port
	})
}

export default app
