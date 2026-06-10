// Local development server. In production, Vercel uses api/index.ts (edge runtime) instead.
import { serve } from "@hono/node-server"
import app from "./index"

serve({ fetch: app.fetch, port: 3000 }, (info) => {
    console.log(`Server running at http://localhost:${info.port}`)
})
