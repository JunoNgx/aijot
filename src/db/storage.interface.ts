import type { Item, Collection } from "@/types"

export interface StorageAdapter {
    // Items
    getItems(): Promise<Item[]>
    getItemById(id: string): Promise<Item | undefined>
    putItem(item: Item): Promise<void>
    deleteItem(id: string): Promise<void>
    bulkPutItems(items: Item[]): Promise<void>

    // Collections
    getCollections(): Promise<Collection[]>
    getCollectionBySlug(slug: string): Promise<Collection | undefined>
    putCollection(collection: Collection): Promise<void>
    deleteCollection(id: string): Promise<void>
    bulkPutCollections(collections: Collection[]): Promise<void>

    // Maintenance
    purgeTrashedItems(cutoffIso: string): Promise<void>
    purgeSoftDeletedItems(cutoffIso: string): Promise<void>
    purgeSoftDeletedCollections(cutoffIso: string): Promise<void>
    clearAllData(): Promise<void>
}
