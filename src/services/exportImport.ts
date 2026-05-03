import { storage } from "@/db"
import { DateTime } from "luxon"
import type { ExportData, ExportSettings, ImportSummary } from "@/types"

export const EXPORT_VERSION = 1

export async function exportData(settings: ExportSettings): Promise<void> {
    const [items, collections] = await Promise.all([
        storage.getItems(),
        storage.getAllCollections(),
    ])

    const data: ExportData = {
        version: EXPORT_VERSION,
        exportedAt: DateTime.now().toUTC().toISO(),
        items,
        collections,
        settings,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `aijot-${DateTime.now().toFormat("yyyy-MM-dd_HH-mm")}.json`
    a.click()
    URL.revokeObjectURL(url)
}

export async function parseImportFile(file: File): Promise<ExportData> {
    const text = await file.text()
    const data = JSON.parse(text) as ExportData

    if (!data.version || !data.items || !data.collections || !data.settings) {
        throw new Error("Invalid export file")
    }

    return data
}

export async function getImportSummary(
    data: ExportData,
): Promise<ImportSummary> {
    const [existingItems, existingCollections] = await Promise.all([
        storage.getItems(),
        storage.getAllCollections(),
    ])

    const existingItemIds = new Set(existingItems.map((i) => i.id))
    const existingCollectionIds = new Set(existingCollections.map((c) => c.id))

    return {
        newItems: data.items.filter((i) => !existingItemIds.has(i.id)).length,
        updatedItems: data.items.filter((i) => existingItemIds.has(i.id))
            .length,
        newCollections: data.collections.filter(
            (c) => !existingCollectionIds.has(c.id),
        ).length,
        updatedCollections: data.collections.filter((c) =>
            existingCollectionIds.has(c.id),
        ).length,
    }
}

export async function commitImport(data: ExportData): Promise<ExportSettings> {
    await Promise.all([
        storage.bulkPutItems(data.items),
        storage.bulkPutCollections(data.collections),
    ])

    return data.settings
}
