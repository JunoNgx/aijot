import { useQuery } from "@tanstack/react-query"
import { storage } from "@/db"
import { queryKeys } from "@/db/queryKeys"
import { useCoreCollectionSettings } from "@/store/coreCollectionSettings"
import { useSyncedUserSettings } from "@/store/syncedUserSettings"
import { buildCoreCollection } from "@/utils/helpers"
import type { Collection } from "@/types"

export function useCollectionsQuery() {
    const { all, untagged, trash } = useCoreCollectionSettings()
    const shouldCustomSortCollections = useSyncedUserSettings(
        (s) => s.shouldCustomSortCollections,
    )

    const collectionsQuery = useQuery({
        queryKey: [...queryKeys.collections, shouldCustomSortCollections],
        queryFn: async () => {
            const userCollections = await storage.getNonDeletedCollections()
            const coreCollections: Collection[] = [
                buildCoreCollection("core-all", all, all.sortOrder, "all"),
                buildCoreCollection(
                    "core-untagged",
                    untagged,
                    untagged.sortOrder,
                    "untagged",
                ),
                buildCoreCollection(
                    "core-trash",
                    trash,
                    trash.sortOrder,
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
