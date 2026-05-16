import { DateTime } from "luxon"
import { toast } from "sonner"
import { useItemsMutations } from "@/hooks/useItemsMutations"
import { openItemDialog } from "@/utils/openItemDialog"
import { buildItem } from "@/utils/itemFactory"
import { parseCreationData } from "@/hooks/useMainInputParser"
import { SYNTAX_PREFIX_LONG_TEXT } from "@/config/constants"
import { useSyncedUserSettings } from "@/store/syncedUserSettings"
import { useTransientUiState } from "@/store/transientUiState"
import { type MouseEvent } from "react"
import type { Item } from "@/types"

export function useItemActions() {
    const {
        createItemMutation,
        updateItemMutation,
        trashItemMutation,
        untrashItemMutation,
        softDeleteItemMutation,
        refetchLinkMetaMutation,
    } = useItemsMutations()

    const shouldApplyTagsOfCurrCollection = useSyncedUserSettings(
        (s) => s.shouldApplyTagsOfCurrCollection,
    )

    const createItem = (
        inputValue: string,
        currCollectionTags: string[] = [],
    ) => {
        const creationData = parseCreationData(inputValue)
        const isLongText = inputValue
            .trimStart()
            .startsWith(SYNTAX_PREFIX_LONG_TEXT)

        if (shouldApplyTagsOfCurrCollection && currCollectionTags.length > 0) {
            const combinedTags = new Set(creationData.tags)
            currCollectionTags.forEach((tag) => combinedTags.add(tag))
            creationData.tags = Array.from(combinedTags)
        }

        createItemMutation.mutate(buildItem(creationData), {
            onSuccess: (item) => {
                if (isLongText) openItemDialog(item)
            },
        })
    }

    const copyContent = (item: Item) => {
        navigator.clipboard.writeText(item.content)
        useTransientUiState.getState().addCopiedItemId(item.id)
        setTimeout(
            () => useTransientUiState.getState().removeCopiedItemId(item.id),
            1500,
        )
    }

    const editItem = (item: Item) => openItemDialog(item)

    const toggleTodo = (item: Item) => {
        updateItemMutation.mutate({
            ...item,
            isDone: !item.isDone,
            updatedAt: DateTime.now().toUTC().toISO(),
        })
    }

    const pinItem = (item: Item) => {
        updateItemMutation.mutate({
            ...item,
            isPinned: true,
            updatedAt: DateTime.now().toUTC().toISO(),
        })
    }

    const unpinItem = (item: Item) => {
        updateItemMutation.mutate({
            ...item,
            isPinned: undefined,
            updatedAt: DateTime.now().toUTC().toISO(),
        })
    }

    const convertToTodo = (item: Item) => {
        updateItemMutation.mutate({
            ...item,
            type: "todo",
            title: undefined,
            updatedAt: DateTime.now().toUTC().toISO(),
        })
    }

    const toggleCopyOnClick = (item: Item) => {
        updateItemMutation.mutate({
            ...item,
            shouldCopyOnClick: item.shouldCopyOnClick ? undefined : true,
            updatedAt: DateTime.now().toUTC().toISO(),
        })
    }

    const refetchLinkMeta = (item: Item) => {
        refetchLinkMetaMutation.mutate(item, {
            onError: (error) => toast.error(error.message),
        })
    }

    const trashItem = (item: Item) => {
        trashItemMutation.mutate(item)
    }

    const restoreItem = (item: Item) => {
        untrashItemMutation.mutate(item)
    }

    const softDeleteItem = (item: Item) => {
        softDeleteItemMutation.mutate(item)
    }

    const triggerPrimaryAction = (item: Item, e?: MouseEvent) => {
        if (item.shouldCopyOnClick) {
            e?.preventDefault()
            copyContent(item)
            return
        }
        if (item.type === "link") {
            // Intentionally do nothing; action is handled natively by browser
            return
        }
        if (item.type === "text") {
            openItemDialog(item)
            return
        }
        if (item.type === "todo") {
            toggleTodo(item)
        }
    }

    return {
        createItem,
        triggerPrimaryAction,
        copyContent,
        editItem,
        toggleTodo,
        pinItem,
        unpinItem,
        convertToTodo,
        toggleCopyOnClick,
        refetchLinkMeta,
        trashItem,
        restoreItem,
        softDeleteItem,
    }
}
