import Dexie, { type Table } from "dexie"
import type { Item, Collection } from "@/types"
import type { StorageAdapter } from "@/db/storage.interface"
import { DB_VERSION } from "@/config/constants"

class AijotDb extends Dexie {
    items!: Table<Item>
    collections!: Table<Collection>

    constructor() {
        super("aijot")
        this.version(DB_VERSION).stores({
            items: "id, type, jottedAt, trashedAt, deletedAt, *tags",
            collections: "id, sortOrder, slug, deletedAt",
        })
    }
}

const db = new AijotDb()

export function closeDb() {
    db.close()
}

export const dexieAdapter: StorageAdapter = {
    async getItems() {
        return db.items.toArray()
    },

    async getItemById(id) {
        return db.items.get(id)
    },

    async putItem(item) {
        await db.items.put(item)
    },

    async deleteItem(id) {
        await db.items.delete(id)
    },

    async bulkPutItems(items) {
        await db.items.bulkPut(items)
    },

    async getCollections() {
        return db.collections.orderBy("sortOrder").toArray()
    },

    async getCollectionBySlug(slug) {
        return db.collections.where("slug").equals(slug).first()
    },

    async putCollection(collection) {
        await db.collections.put(collection)
    },

    async deleteCollection(id) {
        await db.collections.delete(id)
    },

    async bulkPutCollections(collections) {
        await db.collections.bulkPut(collections)
    },

    async purgeTrashedItems(cutoffIso) {
        const expiredItems = await db.items
            .where("trashedAt")
            .below(cutoffIso)
            .filter((item) => !item.deletedAt)
            .toArray()
        if (expiredItems.length === 0) return
        const nowIso = new Date().toISOString()
        await db.items.bulkPut(
            expiredItems.map((item) => ({ ...item, deletedAt: nowIso })),
        )
    },

    async purgeSoftDeletedItems(cutoffIso) {
        const expiredIds = await db.items
            .where("deletedAt")
            .below(cutoffIso)
            .primaryKeys()
        await db.items.bulkDelete(expiredIds as string[])
    },

    async purgeSoftDeletedCollections(cutoffIso) {
        const expiredIds = await db.collections
            .where("deletedAt")
            .below(cutoffIso)
            .primaryKeys()
        await db.collections.bulkDelete(expiredIds as string[])
    },

    async clearAllData() {
        await db.items.clear()
        await db.collections.clear()
    },
}
