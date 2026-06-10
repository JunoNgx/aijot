import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { VitePWA } from "vite-plugin-pwa"
import { resolve } from "path"

export default defineConfig({
    define: {
        "import.meta.env.VERCEL_GIT_COMMIT_SHA": JSON.stringify(
            process.env.VERCEL_GIT_COMMIT_SHA || "dev",
        ),
    },
    resolve: {
        alias: {
            "@": resolve(__dirname, "src"),
        },
    },
    server: {
        proxy: {
            "/api": "http://localhost:3000",
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                loadPaths: ["src"],
            },
        },
    },
    plugins: [
        react(),
        VitePWA({
            registerType: "autoUpdate",
            manifest: {
                name: "ai*jot",
                short_name: "aijot",
                description: "A minimalist keyboard-first note app",
                start_url: "/jot",
                display: "standalone",
                background_color: "#1a1a1a",
                theme_color: "#1a1a1a",
                icons: [
                    {
                        src: "/icon-192.png",
                        sizes: "192x192",
                        type: "image/png",
                    },
                    {
                        src: "/icon-512.png",
                        sizes: "512x512",
                        type: "image/png",
                    },
                    {
                        src: "/icon-maskable-512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "maskable",
                    },
                ],
            },
        }),
    ],
})
