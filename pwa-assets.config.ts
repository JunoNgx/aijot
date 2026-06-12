import {
    defineConfig,
    minimal2023Preset,
} from "@vite-pwa/assets-generator/config"

const ICON_BACKGROUND_COLOR = "#8eada7"
const RESIZE_OPTIONS = {
    background: ICON_BACKGROUND_COLOR,
    fit: "contain",
} as const

export default defineConfig({
    headLinkOptions: {
        preset: "2023",
    },
    preset: {
        ...minimal2023Preset,
        apple: {
            // iOS home screen
            sizes: [180],
            resizeOptions: RESIZE_OPTIONS,
        },
        maskable: {
            // 32: Browser tabs
            // 128: Chrome Web Store
            // 192: Android
            // 512: High-res displays
            sizes: [32, 128, 192, 512],
            resizeOptions: RESIZE_OPTIONS,
        },
    },
    images: ["public/sourceLogo.svg"],
})
