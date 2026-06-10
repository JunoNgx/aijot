import { Hono } from "hono"
import { cors } from "hono/cors"
import googleAuthRoutes from "./routes/googleAuth"
import dropboxAuthRoutes from "./routes/dropboxAuth"
import linkRoutes from "./routes/link"

const app = new Hono({ strict: false })

const ALLOWED_ORIGINS_FALLBACK = "https://aijot.app,https://aijot.vercel.app"

app.use(
    "*",
    cors({
        // Read allowedOrigins inside callback (per-request) instead of at module init.
        // This ensures env vars are properly initialized after Vercel cold start.
        origin: (origin) => {
            const allowedOrigins = (
                process.env.ALLOWED_ORIGINS ?? ALLOWED_ORIGINS_FALLBACK
            )
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            return allowedOrigins.includes(origin) ? origin : null
        },
        allowMethods: ["GET", "POST", "OPTIONS"],
        allowHeaders: ["Content-Type"],
        credentials: true,
    }),
)

app.route("/api/auth/google", googleAuthRoutes)
app.route("/api/auth/dropbox", dropboxAuthRoutes)
app.route("/api/link", linkRoutes)

export default app
