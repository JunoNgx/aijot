import { DateTime } from "luxon"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { SyncedUserSettingsStore } from "@/types"
import {
    DEFAULT_USERNAME,
    DEFAULT_ALL_COLLECTION,
    DEFAULT_UNTAGGED_COLLECTION,
    DEFAULT_TRASH_COLLECTION,
} from "@/config/constants"

const updateTimestamp = () => ({ settingsUpdatedAt: DateTime.now().toISO() })

export const useSyncedUserSettings = create<SyncedUserSettingsStore>()(
    persist(
        (set) => ({
            userDisplayName: DEFAULT_USERNAME,
            shouldApplyTagsOfCurrCollection: true,
            defaultCollectionSlug: "all",
            shouldCustomSortCollections: true,
            shouldShowJotItemExtraInfo: false,
            allCollection: DEFAULT_ALL_COLLECTION,
            untaggedCollection: DEFAULT_UNTAGGED_COLLECTION,
            trashCollection: DEFAULT_TRASH_COLLECTION,
            settingsUpdatedAt: undefined,
            setUserDisplayName: (userDisplayName) =>
                set({ userDisplayName, ...updateTimestamp() }),
            setShouldApplyTagsOfCurrCollection: (value) =>
                set({
                    shouldApplyTagsOfCurrCollection: value,
                    ...updateTimestamp(),
                }),
            setDefaultCollectionSlug: (slug) =>
                set({ defaultCollectionSlug: slug, ...updateTimestamp() }),
            setShouldCustomSortCollections: (value) =>
                set({
                    shouldCustomSortCollections: value,
                    ...updateTimestamp(),
                }),
            setShouldShowJotItemExtraInfo: (value) =>
                set({
                    shouldShowJotItemExtraInfo: value,
                    ...updateTimestamp(),
                }),
            setAllCollection: (config) =>
                set((state) => ({
                    allCollection: { ...state.allCollection, ...config },
                    ...updateTimestamp(),
                })),
            setUntaggedCollection: (config) =>
                set((state) => ({
                    untaggedCollection: {
                        ...state.untaggedCollection,
                        ...config,
                    },
                    ...updateTimestamp(),
                })),
            setTrashCollection: (config) =>
                set((state) => ({
                    trashCollection: { ...state.trashCollection, ...config },
                    ...updateTimestamp(),
                })),
        }),
        { name: "syncedUserSettings" },
    ),
)
