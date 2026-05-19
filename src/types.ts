import type { ReactNode } from "react"
import type { ThemeName } from "@/config/themes"

// ============================================================
// Item
// ============================================================

export type ItemType = "text" | "todo" | "link"
export type FilterType = ItemType | "incompleteTodo" | "completedTodo"

export interface Item {
    id: string
    createdAt: string
    jottedAt: string
    updatedAt: string
    trashedAt?: string
    deletedAt?: string
    title?: string
    content: string
    type: ItemType
    isDone?: boolean
    faviconUrl?: string
    shouldCopyOnClick?: boolean
    isPinned?: boolean
    isRedacted?: boolean
    tags: string[]
    previousContent?: string
    previousContentRecordedAt?: string
}

export type MassTagEditMode = "add" | "replace" | "remove"

// ============================================================
// Collection
// ============================================================

export type CoreCollectionType = "all" | "untagged" | "trash"

export interface Collection {
    id: string
    createdAt: string
    updatedAt: string
    name: string
    icon: string
    slug: string
    sortOrder: number
    tags: string[]
    types: ItemType[]
    deletedAt?: string
    // Not stored in DB; set on core collections only
    coreType?: CoreCollectionType
}

// ============================================================
// Zustand store shapes
// ============================================================

export type ThemeMode = ThemeName

export interface LocalUserSettingsStore {
    theme: ThemeMode
    setTheme: (theme: ThemeMode) => void
    fontFamily: string
    setFontFamily: (font: string) => void
    fontFamilyMono: string
    setFontFamilyMono: (font: string) => void
    is24HourClock: boolean
    setIs24HourClock: (value: boolean) => void
}

export interface LocalAppDataStore {
    shouldShowDemoDataBanner: boolean
    setShouldShowDemoDataBanner: (value: boolean) => void
}

export type SyncStatus = "idle" | "syncing" | "error"

export interface AuthToken {
    id: "google"
    accessToken: string
    expiresAt: string
    email: string
}

export interface LocalSyncDataStore {
    authToken?: AuthToken
    driveFolderId?: string
    lastSyncTime?: string
    syncStatus: SyncStatus
    syncError?: string
    setAuthToken: (token: AuthToken | undefined) => void
    setDriveFolderId: (id: string | undefined) => void
    setLastSyncTime: (time: string) => void
    setSyncStatus: (status: SyncStatus) => void
    setSyncError: (error: string | undefined) => void
}

export interface SyncedUserSettingsStore {
    userDisplayName: string
    shouldApplyTagsOfCurrCollection: boolean
    defaultCollectionSlug: string
    shouldCustomSortCollections: boolean
    shouldShowJotItemExtraInfo: boolean
    allCollection: CoreCollectionConfig
    untaggedCollection: CoreCollectionConfig
    trashCollection: CoreCollectionConfig
    settingsUpdatedAt?: string
    setUserDisplayName: (name: string) => void
    setShouldApplyTagsOfCurrCollection: (value: boolean) => void
    setDefaultCollectionSlug: (slug: string) => void
    setShouldCustomSortCollections: (value: boolean) => void
    setShouldShowJotItemExtraInfo: (value: boolean) => void
    setAllCollection: (config: Partial<CoreCollectionConfig>) => void
    setUntaggedCollection: (config: Partial<CoreCollectionConfig>) => void
    setTrashCollection: (config: Partial<CoreCollectionConfig>) => void
    importAllSettings: (settings: ExportSettings) => void
}

export interface CoreCollectionConfig {
    name: string
    slug: string
    icon: string
    sortOrder: number
    createdAt: string
    updatedAt: string
}

export interface DialogStore {
    isOpen: boolean
    children: ReactNode | null
    openDialog: (options: { children: ReactNode }) => void
    closeAllDialogs: () => void
}

export type CommandPaletteMode = "main" | "theme"

export interface CommandPaletteStore {
    isOpen: boolean
    mode: CommandPaletteMode
    open: (mode?: CommandPaletteMode) => void
    close: () => void
    setMode: (mode: CommandPaletteMode) => void
}

export interface CoreCollectionSettingsStore {
    all: CoreCollectionConfig
    untagged: CoreCollectionConfig
    trash: CoreCollectionConfig
    setAll: (config: Partial<CoreCollectionConfig>) => void
    setUntagged: (config: Partial<CoreCollectionConfig>) => void
    setTrash: (config: Partial<CoreCollectionConfig>) => void
}

// ============================================================
// Main input parser output
// ============================================================

export interface MainInputSearchData {
    filterType?: FilterType
    tags: string[]
    searchText?: string
}

export interface MainInputCreationData {
    itemType: ItemType
    content: string
    title?: string
    tags: string[]
    colSlugs: string[]
}

// ============================================================
// Export / Import
// ============================================================

export interface ExportSettings {
    syncedUserSettings: {
        userDisplayName: string
        shouldApplyTagsOfCurrCollection: boolean
        defaultCollectionSlug: string
        shouldCustomSortCollections: boolean
        shouldShowJotItemExtraInfo: boolean
        settingsUpdatedAt?: string
    }
    coreCollections: {
        all: CoreCollectionConfig
        untagged: CoreCollectionConfig
        trash: CoreCollectionConfig
    }
}

export interface ImportSummary {
    newItems: number
    updatedItems: number
    newCollections: number
    updatedCollections: number
}

export interface ExportData {
    version: number
    exportedAt: string
    items: Item[]
    collections: Collection[]
    settings: ExportSettings
}

// ============================================================
// Link fetch
// ============================================================

export interface LinkFetchResult {
    title: string
    faviconUrl: string
}

// ============================================================
// Auth
// ============================================================

export type TokenResult = string | null | { expired: string }

export interface GisTokenError {
    type: string
    message?: string
}

export interface GisCodeResponse {
    code: string
    error?: string
    error_description?: string
}

export interface GisCodeClientConfig {
    client_id: string
    scope: string
    ux_mode: "popup" | "redirect"
    prompt?: string
    callback: (response: GisCodeResponse) => void
    error_callback?: (error: GisTokenError) => void
}

export interface GisCodeClient {
    requestCode: () => void
}

declare global {
    interface Window {
        google?: {
            accounts: {
                oauth2: {
                    initCodeClient: (
                        config: GisCodeClientConfig,
                    ) => GisCodeClient
                }
            }
        }
    }
}
