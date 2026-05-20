import { DateTime } from "luxon"
import { storage } from "@/db"
import { useLocalSyncData } from "@/store/localSyncData"
import { useSyncedUserSettings } from "@/store/syncedUserSettings"
import type { Collection, Item, ExportSettings } from "@/types"
import type { SyncProvider } from "./syncProviderTypes"

export const DATA_FILE = "data.json"

interface SyncData {
    items: Item[]
    collections: Collection[]
    settings: ExportSettings | null
}

function mergeRecords<T extends { id: string; updatedAt: string }>(
    localRecords: T[],
    remoteRecords: T[],
): T[] {
    const recordMap = new Map<string, T>()
    for (const record of localRecords) recordMap.set(record.id, record)
    for (const record of remoteRecords) {
        const localRecord = recordMap.get(record.id)
        if (!localRecord || record.updatedAt > localRecord.updatedAt) {
            recordMap.set(record.id, record)
        }
    }
    return Array.from(recordMap.values())
}

function mergeSettings(
    local: ExportSettings,
    remote: ExportSettings,
): ExportSettings {
    const localTimestamp = local.syncedUserSettings.settingsUpdatedAt
    const remoteTimestamp = remote.syncedUserSettings.settingsUpdatedAt

    if (!localTimestamp) {
        return remote
    }

    if (remoteTimestamp && remoteTimestamp > localTimestamp) {
        return remote
    }

    return local
}

function getLocalSettings(): ExportSettings {
    const state = useSyncedUserSettings.getState()
    return {
        syncedUserSettings: {
            userDisplayName: state.userDisplayName,
            shouldApplyTagsOfCurrCollection:
                state.shouldApplyTagsOfCurrCollection,
            defaultCollectionSlug: state.defaultCollectionSlug,
            shouldCustomSortCollections: state.shouldCustomSortCollections,
            shouldShowJotItemExtraInfo: state.shouldShowJotItemExtraInfo,
            settingsUpdatedAt: state.settingsUpdatedAt,
        },
        coreCollections: {
            all: state.allCollection,
            untagged: state.untaggedCollection,
            trash: state.trashCollection,
        },
    }
}

export async function runFullSync(
    token: string,
    rootId: string,
    provider: SyncProvider,
): Promise<string> {
    const syncStartTime = DateTime.now().toUTC().toISO()!

    const lastSyncTime = useLocalSyncData.getState().lastSyncTime
    const lastSettingsUpdateTime =
        useSyncedUserSettings.getState().settingsUpdatedAt

    const [localItems, localCollections] = await Promise.all([
        storage.getItems(),
        storage.getAllCollections(),
    ])

    let mergedItems = localItems
    let mergedCollections = localCollections
    let mergedSettings = getLocalSettings()

    const remoteFile = await provider.findFile(token, rootId, DATA_FILE)
    const shouldDownload =
        remoteFile !== null &&
        (!lastSyncTime || remoteFile.modifiedTime > lastSyncTime)

    if (shouldDownload) {
        const remoteData = await provider.downloadFile<SyncData>(
            token,
            remoteFile.id,
        )
        mergedItems = mergeRecords(localItems, remoteData.items ?? [])
        mergedCollections = mergeRecords(
            localCollections,
            remoteData.collections ?? [],
        )

        if (remoteData.settings) {
            mergedSettings = mergeSettings(
                getLocalSettings(),
                remoteData.settings,
            )
            useSyncedUserSettings.getState().importAllSettings(mergedSettings)
        }

        await Promise.all([
            storage.bulkPutItems(mergedItems),
            storage.bulkPutCollections(mergedCollections),
        ])
    }

    const settingsChangedSinceLastSync =
        lastSettingsUpdateTime &&
        mergedSettings.syncedUserSettings.settingsUpdatedAt &&
        mergedSettings.syncedUserSettings.settingsUpdatedAt >
            lastSettingsUpdateTime

    const shouldUpload =
        !lastSyncTime ||
        mergedItems.some((item) => item.updatedAt > lastSyncTime) ||
        mergedCollections.some(
            (collection) => collection.updatedAt > lastSyncTime,
        ) ||
        settingsChangedSinceLastSync

    if (shouldUpload) {
        await provider.upsertFile(
            token,
            rootId,
            DATA_FILE,
            {
                items: mergedItems,
                collections: mergedCollections,
                settings: mergedSettings,
            },
            remoteFile?.id,
        )
    }

    return syncStartTime
}
