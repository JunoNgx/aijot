import { useQuery } from "@tanstack/react-query"
import { storage } from "@/db"
import { queryKeys } from "@/db/queryKeys"

export function useAllTagsQuery() {
    const allTagsQuery = useQuery({
        queryKey: queryKeys.allTags,
        queryFn: async () => {
            const allItems = await storage.getItems()
            const activeItems = allItems.filter(
                (item) => !item.trashedAt && !item.deletedAt,
            )
            const tagByKey = new Map<string, string>()
            for (const item of activeItems) {
                for (const tag of item.tags) {
                    const key = tag.toLowerCase()
                    if (!tagByKey.has(key)) {
                        tagByKey.set(key, tag)
                    }
                }
            }
            return Array.from(tagByKey.values()).sort((a, b) =>
                a.toLowerCase().localeCompare(b.toLowerCase()),
            )
        },
    })

    return { allTagsQuery }
}
