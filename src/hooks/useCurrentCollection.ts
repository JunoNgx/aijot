import { useParams } from "react-router-dom"
import { useCollectionsQuery } from "./useCollectionsQuery"
import type { Collection } from "@/types"

export function useCurrentCollection(): {
    currCollection: Collection | undefined
    currSlug: string
} {
    const { slug } = useParams<{ slug: string }>()
    const { collectionsQuery } = useCollectionsQuery()
    const collections = collectionsQuery.data ?? []
    const currSlug = slug ?? "all"
    const currCollection = collections.find((c) => c.slug === currSlug)
    return { currCollection, currSlug }
}
