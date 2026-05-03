import { DateTime } from "luxon"
import { storage } from "@/db"
import { useLocalSyncData } from "@/store/localSyncData"
import type { Collection, Item } from "@/types"
import { DATA_FILE, downloadFile, findFile, upsertFile } from "./driveClient"

interface DriveData {
    items: Item[]
    collections: Collection[]
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

export async function runFullDriveSync(
    token: string,
    folderId: string,
): Promise<string> {
    const syncStartTime = DateTime.now().toUTC().toISO()!

    const lastSyncTime = useLocalSyncData.getState().lastSyncTime

    const [localItems, localCollections] = await Promise.all([
        storage.getItems(),
        storage.getAllCollections(),
    ])

    let mergedItems = localItems
    let mergedCollections = localCollections

    const remoteFile = await findFile(token, folderId, DATA_FILE)
    const shouldDownload =
        remoteFile !== null &&
        (!lastSyncTime || remoteFile.modifiedTime > lastSyncTime)

    if (shouldDownload) {
        const remoteData = await downloadFile<DriveData>(token, remoteFile.id)
        mergedItems = mergeRecords(localItems, remoteData.items ?? [])
        mergedCollections = mergeRecords(
            localCollections,
            remoteData.collections ?? [],
        )
        await Promise.all([
            storage.bulkPutItems(mergedItems),
            storage.bulkPutCollections(mergedCollections),
        ])
    }

    const shouldUpload =
        !lastSyncTime ||
        mergedItems.some((item) => item.updatedAt > lastSyncTime) ||
        mergedCollections.some(
            (collection) => collection.updatedAt > lastSyncTime,
        )

    if (shouldUpload) {
        await upsertFile(
            token,
            folderId,
            DATA_FILE,
            {
                items: mergedItems,
                collections: mergedCollections,
            },
            remoteFile?.id,
        )
    }

    return syncStartTime
}
