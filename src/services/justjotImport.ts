import { DateTime } from "luxon"
import { storage } from "@/db"
import type { Collection, ImportSummary, Item, ItemType } from "@/types"

// ============================================================
// Random icon helper (mirrors CollectionDialog)
// ============================================================

const RANDOM_ICONS = [
    "💼",
    "🏠",
    "📚",
    "🎯",
    "💡",
    "✈️",
    "🍽️",
    "💰",
    "🎵",
    "🎬",
    "🏋️",
    "🌱",
    "💻",
    "🎮",
    "🛒",
    "❤️",
    "📸",
    "🎓",
    "🔬",
    "🎁",
]

function getRandomIcon(): string {
    return RANDOM_ICONS[Math.floor(Math.random() * RANDOM_ICONS.length)]
}

const ALL_TYPES: ItemType[] = ["text", "todo", "link"]

// ============================================================
// JustJot types
// ============================================================

export interface JustJotCollection {
    id: string
    name: string
    slug: string
    sortOrder: number
    created: string
    updated: string
}

export interface JustJotItem {
    id: string
    collection: string
    title: string
    content: string
    type: ItemType
    shouldCopyOnClick: boolean
    isTodoDone: boolean
    faviconUrl: string
    isTrashed: boolean
    trashedDateTime: string
    created: string
    updated: string
}

export interface JustJotExportData {
    exportedAt: string
    user: {
        id: string
        email: string
        username: string
        displayName: string
        userType: string
    }
    itemCollections: JustJotCollection[]
    items: JustJotItem[]
}

// ============================================================
// Parser
// ============================================================

export async function parseJustJotFile(file: File): Promise<JustJotExportData> {
    const text = await file.text()
    const data = JSON.parse(text) as JustJotExportData

    if (!Array.isArray(data.itemCollections) || !Array.isArray(data.items)) {
        throw new Error("Invalid JustJot export file")
    }

    return data
}

// ============================================================
// Collision resolver
// ============================================================

export function resolveSlugCollisions(
    slug: string,
    existingSlugs: Set<string>,
): string {
    if (!existingSlugs.has(slug)) {
        return slug
    }

    let counter = 1
    let candidate = `${slug}-imported`

    while (existingSlugs.has(candidate)) {
        counter += 1
        candidate = `${slug}-imported-${counter}`
    }

    return candidate
}

function normaliseJustJotDate(dateStr: string): string {
    return DateTime.fromSQL(dateStr).toISO() ?? dateStr
}

// ============================================================
// Transformer
// ============================================================

export async function transformJustJotToAijot(
    data: JustJotExportData,
): Promise<{ collections: Collection[]; items: Item[] }> {
    const existingCollections = await storage.getAllCollections()
    const existingSlugs = new Set(existingCollections.map((c) => c.slug))

    const slugMap = new Map<string, string>()

    const collections: Collection[] = data.itemCollections.map((jc) => {
        const resolvedSlug = resolveSlugCollisions(jc.slug, existingSlugs)
        slugMap.set(jc.id, resolvedSlug)
        existingSlugs.add(resolvedSlug)

        return {
            id: jc.id,
            name: jc.name,
            slug: resolvedSlug,
            sortOrder: jc.sortOrder,
            tags: [resolvedSlug],
            types: [...ALL_TYPES],
            icon: getRandomIcon(),
            createdAt: normaliseJustJotDate(jc.created),
            updatedAt: normaliseJustJotDate(jc.updated),
        }
    })

    const items: Item[] = data.items
        .filter((ji) => !ji.isTrashed)
        .map((ji) => {
            const collectionSlug = slugMap.get(ji.collection) ?? ji.collection
            const isTodo = ji.type === "todo"

            return {
                id: ji.id,
                title: isTodo ? undefined : ji.title.trim() || undefined,
                content: isTodo ? ji.title.trim() : ji.content,
                type: ji.type,
                shouldCopyOnClick: ji.shouldCopyOnClick,
                isDone: ji.isTodoDone,
                faviconUrl: ji.faviconUrl.trim() || undefined,
                tags: [collectionSlug],
                createdAt: normaliseJustJotDate(ji.created),
                updatedAt: normaliseJustJotDate(ji.updated),
                jottedAt: normaliseJustJotDate(ji.created),
            }
        })

    return { collections, items }
}

// ============================================================
// Import summary
// ============================================================

export async function getJustJotImportSummary(
    data: JustJotExportData,
): Promise<ImportSummary> {
    const { collections, items } = await transformJustJotToAijot(data)

    const [existingItems, existingCollections] = await Promise.all([
        storage.getItems(),
        storage.getAllCollections(),
    ])

    const existingItemIds = new Set(existingItems.map((i) => i.id))
    const existingCollectionIds = new Set(existingCollections.map((c) => c.id))

    return {
        newItems: items.filter((i) => !existingItemIds.has(i.id)).length,
        updatedItems: items.filter((i) => existingItemIds.has(i.id)).length,
        newCollections: collections.filter(
            (c) => !existingCollectionIds.has(c.id),
        ).length,
        updatedCollections: collections.filter((c) =>
            existingCollectionIds.has(c.id),
        ).length,
    }
}

// ============================================================
// Commit import
// ============================================================

export async function commitJustJotImport(
    data: JustJotExportData,
): Promise<void> {
    const { collections, items } = await transformJustJotToAijot(data)

    await Promise.all([
        storage.bulkPutCollections(collections),
        storage.bulkPutItems(items),
    ])
}
