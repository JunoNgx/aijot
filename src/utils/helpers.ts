import { DateTime } from "luxon"
import type { Item, Collection, CoreCollectionConfig } from "@/types"

export function generateSlug(str: string): string {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
}

export function formatDatetime(
    isoString: string,
    is24HourClock = true,
): string {
    const date = DateTime.fromISO(isoString).toLocal()
    const now = DateTime.now()
    if (now.diff(date, "hours").hours < 24) {
        return date.toFormat(is24HourClock ? "HH:mm" : "h:mm a")
    }
    if (now.diff(date, "years").years < 1) return date.toFormat("MMM d")
    return date.toFormat("MMM d, yyyy")
}

export function formatDetailedDatetime(
    isoString: string,
    is24HourClock = true,
): string {
    const date = DateTime.fromISO(isoString).toLocal()
    return date.toFormat(
        is24HourClock ? "MMM d, yyyy HH:mm" : "MMM d, yyyy h:mm a",
    )
}

export function formatFullDatetime(
    isoString: string,
    is24HourClock = true,
): string {
    const date = DateTime.fromISO(isoString).toLocal()
    return date.toFormat(
        is24HourClock ? "MMM d, yyyy HH:mm:ss" : "MMM d, yyyy h:mm:ss a",
    )
}

const HEX_COLOUR_REGEX = /#[A-Fa-f0-9]{6}$/

export function isValidHexColourCode(str: string): boolean {
    return HEX_COLOUR_REGEX.test(str.slice(-7))
}

export function sortItems(items: Item[]): Item[] {
    const pinnedItems = items.filter((item) => item.isPinned)
    const unpinnedItems = items.filter((item) => !item.isPinned)
    return [...pinnedItems, ...unpinnedItems]
}

export function buildCoreCollection(
    id: string,
    config: CoreCollectionConfig,
    sortOrder: number,
    coreType: Collection["coreType"],
): Collection {
    return {
        id,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
        name: config.name,
        icon: config.icon,
        slug: config.slug,
        sortOrder,
        tags: [],
        types: ["text", "todo", "link"],
        coreType,
    }
}

export function parseShortcut(shortcut: string): string[] {
    const isMac = navigator.platform.toLowerCase().includes("mac")

    return shortcut.split(/[+,]/).map((part) => {
        const lower = part.toLowerCase().trim()
        if (lower === "mod") return isMac ? "Cmd" : "Ctrl"
        if (lower === "shift") return "Shift"
        if (lower === "alt") return isMac ? "Opt" : "Alt"
        // Keep "n" lowercase for collection jump hint, capitalize other single letters
        if (part === "n") return "n"
        if (part.length === 1) return part.toUpperCase()
        // Handle special keys - use symbols for arrows and enter
        if (lower === "arrowup") return "↑"
        if (lower === "arrowdown") return "↓"
        if (lower === "arrowleft") return "←"
        if (lower === "arrowright") return "→"
        if (lower === "backspace") return "BkSp"
        if (lower === "enter") return "↵"
        if (lower === "escape") return "Esc"
        if (lower === "home") return "Home"
        if (lower === "end") return "End"
        // Handle slash key
        if (lower === "slash") return "/"
        if (lower === "backslash") return "\\"
        return part
    })
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
    let r: number
    let g: number
    let b: number

    if (hex.length === 4) {
        r = Number("0x" + hex[1] + hex[1])
        g = Number("0x" + hex[2] + hex[2])
        b = Number("0x" + hex[3] + hex[3])
    } else if (hex.length === 7) {
        r = Number("0x" + hex[1] + hex[2])
        g = Number("0x" + hex[3] + hex[4])
        b = Number("0x" + hex[5] + hex[6])
    } else {
        r = 0
        g = 0
        b = 0
    }

    r /= 255
    g /= 255
    b /= 255

    const cmin = Math.min(r, g, b)
    const cmax = Math.max(r, g, b)
    const delta = cmax - cmin

    let h = 0
    let s = 0
    let l = 0

    if (delta === 0) h = 0
    else if (cmax === r) h = ((g - b) / delta) % 6
    else if (cmax === g) h = (b - r) / delta + 2
    else h = (r - g) / delta + 4

    h = Math.round(h * 60)
    if (h < 0) h += 360

    l = (cmax + cmin) / 2
    s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))
    s = +(s * 100)
    l = +(l * 100)

    return { h, s, l }
}

export function getLightness(hex: string): number {
    return hexToHsl(hex).l
}

export function pluralise(
    count: number,
    singular: string,
    plural?: string,
): string {
    if (plural) return count === 1 ? singular : plural
    return count === 1 ? singular : `${singular}s`
}

export function truncateText(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) return text
    return text.slice(0, maxLength).trim() + "..."
}
