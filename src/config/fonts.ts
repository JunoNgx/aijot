export interface FontOption {
    name: string
    cssName: string
    importPath: string
}

export const SANS_SERIF_FONTS: FontOption[] = [
    {
        name: "Space Grotesk",
        cssName: "Space Grotesk",
        importPath: "@fontsource/space-grotesk",
    },
    {
        name: "Fira Sans",
        cssName: "Fira Sans",
        importPath: "@fontsource/fira-sans",
    },
    {
        name: "Inclusive Sans",
        cssName: "Inclusive Sans",
        importPath: "@fontsource/inclusive-sans",
    },
    {
        name: "Plus Jakarta Sans",
        cssName: "Plus Jakarta Sans",
        importPath: "@fontsource/plus-jakarta-sans",
    },
    {
        name: "Be Vietnam Pro",
        cssName: "Be Vietnam Pro",
        importPath: "@fontsource/be-vietnam-pro",
    },
    {
        name: "Hanken Grotesk",
        cssName: "Hanken Grotesk",
        importPath: "@fontsource/hanken-grotesk",
    },
    {
        name: "Standard Book",
        cssName: "Standard Book",
        importPath: "@/assets/fonts/standardBook.css",
    },
    {
        name: "Work Sans",
        cssName: "Work Sans",
        importPath: "@fontsource/work-sans",
    },
]

export const MONO_FONTS: FontOption[] = [
    {
        name: "Space Mono",
        cssName: "Space Mono",
        importPath: "@fontsource/space-mono",
    },
    {
        name: "Roboto Mono",
        cssName: "Roboto Mono",
        importPath: "@fontsource/roboto-mono",
    },
    {
        name: "Fira Code",
        cssName: "Fira Code",
        importPath: "@fontsource/fira-code",
    },
    {
        name: "DM Mono",
        cssName: "DM Mono",
        importPath: "@fontsource/dm-mono",
    },
]
