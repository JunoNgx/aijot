import { defineConfig } from "@vite-pwa/assets-generator/config"

export default defineConfig({
    headLinkOptions: {
        preset: "2023",
    },
    preset: {
        apple: { sizes: [] },
        maskable: { sizes: [] },
        transparent: {
            sizes: [32],
            favicons: [[48, "favicon.ico"]],
        },
    },
    images: ["public/sourceLogoWithOutline.svg"],
})
