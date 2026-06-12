import {
    defineConfig,
    minimal2023Preset,
} from "@vite-pwa/assets-generator/config"

export default defineConfig({
    headLinkOptions: {
        preset: "2023",
    },
    preset: {
        ...minimal2023Preset,
        apple: { sizes: [] },
        maskable: { sizes: [] },
        transparent: {
            sizes: [],
            favicons: [[48, "favicon.ico"]],
        },
    },
    images: ["public/sourceLogoWithOutline.svg"],
})
