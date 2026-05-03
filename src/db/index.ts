import { dexieAdapter, closeDb } from "@/db/dexie.adapter"
import type { StorageAdapter } from "@/db/storage.interface"
import {
    TRASH_PURGE_DURATION_DAY,
    SOFT_DELETE_PURGE_DURATION_DAY,
} from "@/config/constants"
import { DateTime } from "luxon"

// Platform factory: swap adapter here for Electron (SQLite) in future
export const storage: StorageAdapter = dexieAdapter

export async function purgeExpiredData(): Promise<void> {
    const trashCutoff = DateTime.now()
        .minus({ days: TRASH_PURGE_DURATION_DAY })
        .toUTC()
        .toISO()
    const tombstoneCutoff = DateTime.now()
        .minus({ days: SOFT_DELETE_PURGE_DURATION_DAY })
        .toUTC()
        .toISO()
    await storage.purgeTrashedItems(trashCutoff)
    await storage.purgeSoftDeletedItems(tombstoneCutoff)
    await storage.purgeSoftDeletedCollections(tombstoneCutoff)
}

export async function forceDeleteDb(): Promise<void> {
    closeDb()
    await new Promise<void>((resolve, reject) => {
        const request = indexedDB.deleteDatabase("aijot")
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
        request.onblocked = () => {
            reject(
                new Error(
                    "Database delete blocked. Close other tabs using this app and try again.",
                ),
            )
        }
    })
}

export type { StorageAdapter }
