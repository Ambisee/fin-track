import dotenv from "dotenv"

let isDotEnvLoaded = false

export const isDebug = () => {
	return process.env.DEBUG?.toLowerCase() === "true"
}

export const loadDotenv = () => {
	if (isDebug() && !isDotEnvLoaded) {
		dotenv.config()
		isDotEnvLoaded = true
	}
}
