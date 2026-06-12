import {
    defineConfig,
    minimal2023Preset,
} from "@vite-pwa/assets-generator/config"

const ICON_BACKGROUND_COLOR = "#8eada7"
const RESIZE_OPTIONS = { background: ICON_BACKGROUND_COLOR, fit: "contain" } as const

export default defineConfig({
    headLinkOptions: {
        preset: "2023",
    },
    preset: {
        ...minimal2023Preset,
        transparent: {
            sizes: [64, 192, 512],
            favicons: [[48, "favicon.ico"]],
            resizeOptions: RESIZE_OPTIONS,
        },
        maskable: {
            sizes: [512],
            resizeOptions: RESIZE_OPTIONS,
        },
        apple: {
            sizes: [180],
            resizeOptions: RESIZE_OPTIONS,
        },
    },
    images: ["public/sourceLogo.svg"],
})
