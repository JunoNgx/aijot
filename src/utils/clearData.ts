import { toast } from "sonner"
import { storage, forceDeleteDb as deleteDb } from "@/db"
import { useLocalAppData } from "@/store/localAppData"
import { useLocalSyncData } from "@/store/localSyncData"
import { useLocalUserSettings } from "@/store/localUserSettings"
import { useSyncedUserSettings } from "@/store/syncedUserSettings"

export async function clearAllData(): Promise<void> {
    try {
        await storage.clearAllData()
    } catch (err) {
        throw new Error(`Failed to clear database: ${(err as Error).message}`)
    }
}

export async function forceDeleteDb(): Promise<void> {
    await deleteDb()
}

export async function clearAllCaches(): Promise<void> {
    if (!("caches" in window)) return
    const keys = await caches.keys()
    await Promise.all(keys.map((key) => caches.delete(key)))
}

export function resetZustandStores(): void {
    useLocalAppData.persist.clearStorage()
    useLocalSyncData.persist.clearStorage()
    useLocalUserSettings.persist.clearStorage()
    useSyncedUserSettings.persist.clearStorage()
}

export function clearAllStorage(): void {
    localStorage.clear()
    sessionStorage.clear()
}

export async function resetApp(): Promise<void> {
    try {
        resetZustandStores()
    } catch (err) {
        throw new Error(`Failed to reset app state: ${(err as Error).message}`)
    }

    try {
        clearAllStorage()
    } catch (err) {
        throw new Error(
            `Failed to clear browser storage: ${(err as Error).message}`,
        )
    }

    try {
        await forceDeleteDb()
    } catch (err) {
        throw new Error(`Failed to delete database: ${(err as Error).message}`)
    }

    try {
        await clearAllCaches()
    } catch (err) {
        throw new Error(`Failed to clear caches: ${(err as Error).message}`)
    }

    toast.loading("App reset. Reloading...")
    setTimeout(() => {
        window.location.href = "/"
    }, 1500)
}
