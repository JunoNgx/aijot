import { useMutation, useQueryClient } from "@tanstack/react-query"
import { DateTime } from "luxon"
import { toast } from "sonner"
import { storage } from "@/db"
import { queryKeys } from "@/db/queryKeys"
import { fetchLinkMeta } from "@/services/linkFetch"
import { useTransientUiState } from "@/store/transientUiState"
import type { Item, MassTagEditMode } from "@/types"
import { sortItems } from "@/utils/helpers"

export function useItemsMutations() {
    const queryClient = useQueryClient()

    const invalidateItemQueries = () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.items })
        queryClient.invalidateQueries({ queryKey: queryKeys.trashedItems })
    }

    const createItemMutation = useMutation({
        mutationFn: async (item: Item) => {
            await storage.putItem(item)
            return item
        },
        onMutate: async (item) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.items })
            const previousItems = queryClient.getQueryData<Item[]>(
                queryKeys.items,
            )
            queryClient.setQueryData<Item[]>(queryKeys.items, (prev) => [
                item,
                ...(prev ?? []),
            ])
            return { previousItems }
        },
        onError: (_err, _item, context) => {
            queryClient.setQueryData(queryKeys.items, context?.previousItems)
        },
        onSuccess: (item) => {
            if (item.type === "link") {
                refetchLinkMetaMutation.mutate(item)
            }
        },
        onSettled: () => {
            invalidateItemQueries()
        },
    })

    const updateItemMutation = useMutation({
        mutationFn: async (updatedItem: Item) => {
            const existingItem = await storage.getItemById(updatedItem.id)
            const shouldSavePreviousContent =
                !!existingItem &&
                updatedItem.type === "text" &&
                existingItem.content !== updatedItem.content

            const itemToStore = shouldSavePreviousContent
                ? {
                      ...updatedItem,
                      previousContent: existingItem!.content,
                      previousContentRecordedAt: DateTime.now().toUTC().toISO(),
                  }
                : updatedItem

            await storage.putItem(itemToStore)
        },
        onMutate: async (updatedItem) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.items })
            const previousItems = queryClient.getQueryData<Item[]>(
                queryKeys.items,
            )
            queryClient.setQueryData<Item[]>(queryKeys.items, (prev) =>
                (prev ?? []).map((i) =>
                    i.id === updatedItem.id ? updatedItem : i,
                ),
            )
            return { previousItems }
        },
        onError: (_err, _item, context) => {
            queryClient.setQueryData(queryKeys.items, context?.previousItems)
        },
        onSettled: () => {
            invalidateItemQueries()
        },
    })

    const trashItemMutation = useMutation({
        mutationFn: async (item: Item) => {
            const now = DateTime.now().toUTC().toISO()
            await storage.putItem({ ...item, trashedAt: now, updatedAt: now })
        },
        onMutate: async (item) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.items })
            const previousItems = queryClient.getQueryData<Item[]>(
                queryKeys.items,
            )
            queryClient.setQueryData<Item[]>(queryKeys.items, (prev) =>
                (prev ?? []).filter((i) => i.id !== item.id),
            )
            return { previousItems }
        },
        onSuccess: (_data, item) => {
            toast("Item moved to trash bin", {
                action: {
                    label: "Undo",
                    onClick: () => {
                        untrashItemMutation.mutate(item)
                    },
                },
            })
        },
        onError: (_err, _item, context) => {
            queryClient.setQueryData(queryKeys.items, context?.previousItems)
        },
        onSettled: () => {
            invalidateItemQueries()
        },
    })

    const untrashItemMutation = useMutation({
        mutationFn: async (item: Item) => {
            const { trashedAt: _trashedAt, ...restoredItem } = item
            await storage.putItem({
                ...restoredItem,
                updatedAt: DateTime.now().toUTC().toISO(),
            })
        },
        onMutate: async (item) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.items })
            const previousItems = queryClient.getQueryData<Item[]>(
                queryKeys.items,
            )
            const { trashedAt: _trashedAt, ...restoredItem } = item
            queryClient.setQueryData<Item[]>(queryKeys.items, (prev) =>
                sortItems(
                    [...(prev ?? []), restoredItem].sort((a, b) =>
                        b.jottedAt.localeCompare(a.jottedAt),
                    ),
                ),
            )
            return { previousItems }
        },
        onError: (_err, _item, context) => {
            queryClient.setQueryData(queryKeys.items, context?.previousItems)
        },
        onSettled: () => {
            invalidateItemQueries()
        },
    })

    const softDeleteItemMutation = useMutation({
        mutationFn: async (item: Item) => {
            const now = DateTime.now().toUTC().toISO()
            await storage.putItem({ ...item, deletedAt: now, updatedAt: now })
        },
        onMutate: async (item) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.items })
            const previousItems = queryClient.getQueryData<Item[]>(
                queryKeys.items,
            )
            queryClient.setQueryData<Item[]>(queryKeys.items, (prev) =>
                (prev ?? []).filter((i) => i.id !== item.id),
            )
            return { previousItems }
        },
        onSuccess: (_data, item) => {
            toast("Item has been deleted", {
                action: {
                    label: "Undo",
                    onClick: () => {
                        undeleteItemMutation.mutate(item)
                    },
                },
            })
        },
        onError: (_err, _item, context) => {
            queryClient.setQueryData(queryKeys.items, context?.previousItems)
        },
        onSettled: () => {
            invalidateItemQueries()
        },
    })

    const undeleteItemMutation = useMutation({
        mutationFn: async (item: Item) => {
            const { deletedAt: _deletedAt, ...restoredItem } = item
            await storage.putItem({
                ...restoredItem,
                updatedAt: DateTime.now().toUTC().toISO(),
            })
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: queryKeys.items })
            const previousItems = queryClient.getQueryData<Item[]>(
                queryKeys.items,
            )
            return { previousItems }
        },
        onError: (_err, _item, context) => {
            queryClient.setQueryData(queryKeys.items, context?.previousItems)
        },
        onSettled: () => {
            invalidateItemQueries()
        },
    })

    const refetchLinkMetaMutation = useMutation({
        mutationFn: async (item: Item) => {
            if (item.type !== "link") {
                throw new Error("Item is not a link")
            }
            useTransientUiState.getState().addFetchingLinkMetaItemId(item.id)
            const meta = await fetchLinkMeta(item.content)
            const updatedItem = {
                ...item,
                title: meta.title,
                faviconUrl: meta.faviconUrl,
                updatedAt: DateTime.now().toUTC().toISO(),
            }
            await storage.putItem(updatedItem)
            return updatedItem
        },
        onSettled: (_data, _error, item) => {
            if (item) {
                useTransientUiState
                    .getState()
                    .removeFetchingLinkMetaItemId(item.id)
            }
            invalidateItemQueries()
        },
    })

    const parseTagStr = (tagStr: string): string[] => {
        return tagStr
            .replace(/  +/g, " ")
            .trim()
            .split(" ")
            .filter((t) => t.length > 0)
    }

    const applyTagMode = (
        existingTags: string[],
        incomingTags: string[],
        mode: MassTagEditMode,
    ): string[] => {
        if (mode === "add") {
            return [...new Set([...existingTags, ...incomingTags])]
        }
        if (mode === "remove") {
            return existingTags.filter((tag) => !incomingTags.includes(tag))
        }
        return incomingTags
    }

    const getTagModeActionLabel = (mode: MassTagEditMode): string => {
        if (mode === "add") return "added to"
        if (mode === "remove") return "removed from"
        return "set for"
    }

    const massTagEditMutation = useMutation({
        mutationFn: async ({
            items,
            tagStr,
            mode,
        }: {
            items: Item[]
            tagStr: string
            mode: MassTagEditMode
        }) => {
            const incomingTags = parseTagStr(tagStr)
            const now = DateTime.now().toISO()
            const updatedItems: Item[] = items.map((item) => {
                const updatedTags = applyTagMode(item.tags, incomingTags, mode)
                return { ...item, tags: updatedTags, updatedAt: now }
            })
            await storage.bulkPutItems(updatedItems)
        },
        onMutate: async ({ items, tagStr, mode }) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.items })
            const previousItems = queryClient.getQueryData<Item[]>(
                queryKeys.items,
            )

            const incomingTags = parseTagStr(tagStr)
            queryClient.setQueryData<Item[]>(queryKeys.items, (prev) =>
                (prev ?? []).map((item) => {
                    const isAffected = items.some((i) => i.id === item.id)
                    if (!isAffected) return item
                    const updatedTags = applyTagMode(
                        item.tags,
                        incomingTags,
                        mode,
                    )
                    return { ...item, tags: updatedTags }
                }),
            )

            return { previousItems, itemsSnapshot: items }
        },
        onError: (_err, _variables, context) => {
            if (context?.previousItems) {
                queryClient.setQueryData(queryKeys.items, context.previousItems)
            }
        },
        onSuccess: (_data, { items, mode }) => {
            const actionLabel = getTagModeActionLabel(mode)
            toast(`Tags ${actionLabel} ${items.length} items`, {
                duration: 10 * 1000,
                action: {
                    label: "Undo",
                    onClick: () => {
                        undoMassTagEditMutation.mutate({
                            itemsSnapshot: items,
                        })
                    },
                },
            })
        },
        onSettled: () => {
            invalidateItemQueries()
        },
    })

    const undoMassTagEditMutation = useMutation({
        mutationFn: async ({ itemsSnapshot }: { itemsSnapshot: Item[] }) => {
            await storage.bulkPutItems(itemsSnapshot)
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: queryKeys.items })
            const previousItems = queryClient.getQueryData<Item[]>(
                queryKeys.items,
            )
            return { previousItems }
        },
        onError: (_err, _variables, context) => {
            if (context?.previousItems) {
                queryClient.setQueryData(queryKeys.items, context.previousItems)
            }
        },
        onSettled: () => {
            invalidateItemQueries()
        },
    })

    return {
        createItemMutation,
        updateItemMutation,
        trashItemMutation,
        untrashItemMutation,
        softDeleteItemMutation,
        undeleteItemMutation,
        refetchLinkMetaMutation,
        massTagEditMutation,
    }
}
