import { useQuery } from "@tanstack/react-query"
import { storage } from "@/db"
import { queryKeys } from "@/db/queryKeys"
import { useSyncedUserSettings } from "@/store/syncedUserSettings"
import { buildCoreCollection } from "@/utils/helpers"
import type { Collection } from "@/types"

export function useCollectionsQuery() {
    const { allCollection, untaggedCollection, trashCollection } =
        useSyncedUserSettings()
    const shouldCustomSortCollections = useSyncedUserSettings(
        (s) => s.shouldCustomSortCollections,
    )

    const collectionsQuery = useQuery({
        queryKey: [
            ...queryKeys.collections,
            shouldCustomSortCollections,
            allCollection.updatedAt,
            untaggedCollection.updatedAt,
            trashCollection.updatedAt,
        ],
        queryFn: async () => {
            const userCollections = await storage.getNonDeletedCollections()
            const coreCollections: Collection[] = [
                buildCoreCollection(
                    "core-all",
                    allCollection,
                    allCollection.sortOrder,
                    "all",
                ),
                buildCoreCollection(
                    "core-untagged",
                    untaggedCollection,
                    untaggedCollection.sortOrder,
                    "untagged",
                ),
                buildCoreCollection(
                    "core-trash",
                    trashCollection,
                    trashCollection.sortOrder,
                    "trash",
                ),
            ]
            const allCollections = [...coreCollections, ...userCollections]
            if (shouldCustomSortCollections) {
                return allCollections.sort((a, b) => a.sortOrder - b.sortOrder)
            }
            return allCollections.sort((a, b) => a.name.localeCompare(b.name))
        },
    })

    return { collectionsQuery }
}
