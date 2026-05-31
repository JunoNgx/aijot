import { create } from "zustand"
import type { Item } from "@/types"

export const useTransientUiState = create<{
    copiedItemIds: string[]
    addCopiedItemId: (id: string) => void
    removeCopiedItemId: (id: string) => void
    fetchingLinkMetaItemIds: string[]
    addFetchingLinkMetaItemId: (id: string) => void
    removeFetchingLinkMetaItemId: (id: string) => void
    mainListVisibleItems: Item[]
    setMainListVisibleItems: (items: Item[]) => void
    isJotItemExpandedModeEnabled: boolean
    setIsJotItemExpandedModeEnabled: (val: boolean) => void
}>((set) => ({
    copiedItemIds: [],
    addCopiedItemId: (id) =>
        set((state) => ({
            copiedItemIds: [
                ...state.copiedItemIds.filter(
                    (existingId) => existingId !== id,
                ),
                id,
            ],
        })),
    removeCopiedItemId: (id) =>
        set((state) => ({
            copiedItemIds: state.copiedItemIds.filter(
                (existingId) => existingId !== id,
            ),
        })),
    fetchingLinkMetaItemIds: [],
    addFetchingLinkMetaItemId: (id) =>
        set((state) => ({
            fetchingLinkMetaItemIds: [
                ...state.fetchingLinkMetaItemIds.filter(
                    (existingId) => existingId !== id,
                ),
                id,
            ],
        })),
    removeFetchingLinkMetaItemId: (id) =>
        set((state) => ({
            fetchingLinkMetaItemIds: state.fetchingLinkMetaItemIds.filter(
                (existingId) => existingId !== id,
            ),
        })),
    mainListVisibleItems: [],
    setMainListVisibleItems: (items) => set({ mainListVisibleItems: items }),
    isJotItemExpandedModeEnabled: false,
    setIsJotItemExpandedModeEnabled: (val) =>
        set({ isJotItemExpandedModeEnabled: val }),
}))
