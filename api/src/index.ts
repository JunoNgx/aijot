import { Hono } from "hono"
import googleAuthRoutes from "./routes/googleAuth"
import dropboxAuthRoutes from "./routes/dropboxAuth"
import linkRoutes from "./routes/link"

const app = new Hono({ strict: false })

app.route("/api/auth/google", googleAuthRoutes)
app.route("/api/auth/dropbox", dropboxAuthRoutes)
app.route("/api/link", linkRoutes)

export default app
