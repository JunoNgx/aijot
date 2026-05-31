import { DateTime } from "luxon"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { SyncedUserSettingsStore, ExportSettings } from "@/types"
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
            shouldEnableJotItemExpandedModeByDefault: false,
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
            setShouldEnableJotItemExpandedModeByDefault: (value) =>
                set({
                    shouldEnableJotItemExpandedModeByDefault: value,
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
            importAllSettings: (settings: ExportSettings) =>
                set({
                    userDisplayName:
                        settings.syncedUserSettings.userDisplayName,
                    shouldApplyTagsOfCurrCollection:
                        settings.syncedUserSettings
                            .shouldApplyTagsOfCurrCollection,
                    defaultCollectionSlug:
                        settings.syncedUserSettings.defaultCollectionSlug,
                    shouldCustomSortCollections:
                        settings.syncedUserSettings.shouldCustomSortCollections,
                    shouldEnableJotItemExpandedModeByDefault:
                        settings.syncedUserSettings
                            .shouldEnableJotItemExpandedModeByDefault,
                    allCollection: settings.coreCollections.all,
                    untaggedCollection: settings.coreCollections.untagged,
                    trashCollection: settings.coreCollections.trash,
                    settingsUpdatedAt:
                        settings.syncedUserSettings.settingsUpdatedAt,
                }),
        }),
        { name: "syncedUserSettings" },
    ),
)
