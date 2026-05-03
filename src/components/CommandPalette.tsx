import { useRef, useLayoutEffect, useEffect } from "react"
import { Command } from "cmdk"
import * as Dialog from "@radix-ui/react-dialog"
import { useLocation } from "react-router-dom"
import { useLocalUserSettings } from "@/store/localUserSettings"
import { useNavigateRoutes } from "@/hooks/useNavigateRoutes"
import { useCollectionsQuery } from "@/hooks/useCollectionsQuery"
import { useSyncedUserSettings } from "@/store/syncedUserSettings"
import { useTransientUiState } from "@/store/transientUiState"
import { useItemsMutations } from "@/hooks/useItemsMutations"
import { openCollectionDialog } from "@/utils/openCollectionDialog"
import { openMassTagEditDialog } from "@/utils/openMassTagEditDialog"
import { themes } from "@/config/themes"
import type { ThemeName } from "@/config/themes"
import styles from "./CommandPalette.module.scss"
import { ICON_PROPS_NORMAL, ROUTE_JOT } from "@/config/constants"
import {
    IconWritingSign,
    IconStack2,
    IconSettings,
    IconHelp,
    IconPalette,
    IconCheck,
    IconPlus,
    IconTags,
} from "@tabler/icons-react"

export type CommandPaletteMode = "main" | "theme"

interface CommandPaletteProps {
    mode: CommandPaletteMode
    onModeChange: (mode: CommandPaletteMode) => void
    onClose: () => void
}

export default function CommandPalette({
    mode,
    onModeChange,
    onClose,
}: CommandPaletteProps) {
    const currentTheme = useLocalUserSettings((s) => s.theme)
    const setTheme = useLocalUserSettings((s) => s.setTheme)
    const originalThemeRef = useRef(currentTheme)
    const listRef = useRef<HTMLDivElement>(null)
    const didCommitThemeSelection = useRef(false)

    const {
        navigateToJot,
        navigateToCollection,
        navigateToCollections,
        navigateToSettings,
        navigateToHelp,
    } = useNavigateRoutes()

    const location = useLocation()
    const currentSlug = location.pathname.startsWith(`${ROUTE_JOT}/`)
        ? (location.pathname.split("/").pop() ?? null)
        : null
    const defaultCollectionSlug = useSyncedUserSettings(
        (s) => s.defaultCollectionSlug,
    )
    const setDefaultCollectionSlug = useSyncedUserSettings(
        (s) => s.setDefaultCollectionSlug,
    )
    const { collectionsQuery } = useCollectionsQuery()
    const collections = collectionsQuery.data ?? []

    const { massTagEditMutation } = useItemsMutations()
    const mainListVisibleItems = useTransientUiState(
        (s) => s.mainListVisibleItems,
    )
    const isOnJotPage =
        location.pathname === ROUTE_JOT ||
        location.pathname.startsWith(`${ROUTE_JOT}/`)

    const isMainMode = mode === "main"
    const isThemeMode = mode === "theme"
    const searchPlaceholder = isThemeMode ? "Search theme" : "Search action"

    const isInCollection = !!currentSlug
    const shouldIncludeSetDefaultAction =
        isInCollection && defaultCollectionSlug !== currentSlug

    const handleNavigation = (action: () => void) => {
        action()
        onClose()
    }

    const handleThemeSelect = (themeName: ThemeName) => {
        didCommitThemeSelection.current = true
        setTheme(themeName)
        onClose()
    }

    const revertThemePreview = () => {
        if (!isThemeMode) return
        setTheme(originalThemeRef.current)
    }

    useLayoutEffect(() => {
        if (!isThemeMode) return
        originalThemeRef.current = currentTheme
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (isThemeMode) {
            revertThemePreview()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode])

    useEffect(() => {
        if (!isThemeMode || !listRef.current) return

        setTimeout(() => {
            const selectedItemEl = listRef.current?.querySelector(
                "[data-selected='true']",
            )
            if (selectedItemEl) {
                selectedItemEl.scrollIntoView({
                    block: "center",
                    behavior: "smooth",
                })
            }
        }, 0)
    }, [mode, isThemeMode])

    const collectionsGroup = (
        <Command.Group
            heading={
                <span className={styles.CommandPaletteGroup__Heading}>
                    Collections
                </span>
            }
            className={styles.CommandPaletteGroup__Group}
        >
            {collections.map((collection) => (
                <Command.Item
                    key={collection.slug}
                    value={`${collection.name} ${collection.slug}`}
                    className={styles.CommandPaletteItem__Item}
                    onSelect={() =>
                        handleNavigation(() =>
                            navigateToCollection(collection.slug),
                        )
                    }
                >
                    <span>{collection.icon}</span>
                    <div className={styles.CommandPaletteItem__ItemContent}>
                        <span className={styles.CommandPaletteItem__LabelLine}>
                            {collection.name}
                        </span>
                        <span className={styles.CommandPaletteItem__SubLabel}>
                            /{collection.slug}
                        </span>
                    </div>
                </Command.Item>
            ))}
        </Command.Group>
    )

    const createCollectionItem = (
        <Command.Item
            value="create collection"
            className={styles.CommandPaletteItem__Item}
            onSelect={() => handleNavigation(() => openCollectionDialog())}
        >
            <IconPlus {...ICON_PROPS_NORMAL} />
            <div className={styles.CommandPaletteItem__ItemContent}>
                <span className={styles.CommandPaletteItem__LabelLine}>
                    Create new collection
                </span>
            </div>
        </Command.Item>
    )

    const setDefaultItem = shouldIncludeSetDefaultAction && (
        <Command.Item
            value={`set ${currentSlug} as default`}
            className={styles.CommandPaletteItem__Item}
            onSelect={() =>
                handleNavigation(() => setDefaultCollectionSlug(currentSlug!))
            }
        >
            <IconCheck {...ICON_PROPS_NORMAL} />
            <div className={styles.CommandPaletteItem__ItemContent}>
                <span className={styles.CommandPaletteItem__LabelLine}>
                    Set "{currentSlug}" as default
                </span>
            </div>
        </Command.Item>
    )

    const editCollectionItem = isInCollection && (
        <Command.Item
            value="edit current collection"
            className={styles.CommandPaletteItem__Item}
            onSelect={() => {
                const collection = collections.find(
                    (c) => c.slug === currentSlug,
                )
                if (collection) {
                    handleNavigation(() => openCollectionDialog(collection))
                }
            }}
        >
            <IconSettings {...ICON_PROPS_NORMAL} />
            <div className={styles.CommandPaletteItem__ItemContent}>
                <span className={styles.CommandPaletteItem__LabelLine}>
                    Edit current collection
                </span>
            </div>
        </Command.Item>
    )

    const collectionActionsGroup = (
        <Command.Group
            heading={
                <span className={styles.CommandPaletteGroup__Heading}>
                    Collection Actions
                </span>
            }
            className={styles.CommandPaletteGroup__Group}
        >
            {createCollectionItem}
            {setDefaultItem}
            {editCollectionItem}
        </Command.Group>
    )

    const goToJotItem = (
        <Command.Item
            value="go to jot"
            className={styles.CommandPaletteItem__Item}
            onSelect={() => handleNavigation(navigateToJot)}
        >
            <IconWritingSign {...ICON_PROPS_NORMAL} />
            <div className={styles.CommandPaletteItem__ItemContent}>
                <span className={styles.CommandPaletteItem__LabelLine}>
                    Go to Jot Items
                </span>
            </div>
        </Command.Item>
    )

    const goToCollectionsItem = (
        <Command.Item
            value="go to collections"
            className={styles.CommandPaletteItem__Item}
            onSelect={() => handleNavigation(navigateToCollections)}
        >
            <IconStack2 {...ICON_PROPS_NORMAL} />
            <div className={styles.CommandPaletteItem__ItemContent}>
                <span className={styles.CommandPaletteItem__LabelLine}>
                    Go to Manage Collections
                </span>
            </div>
        </Command.Item>
    )

    const goToSettingsItem = (
        <Command.Item
            value="go to settings"
            className={styles.CommandPaletteItem__Item}
            onSelect={() => handleNavigation(navigateToSettings)}
        >
            <IconSettings {...ICON_PROPS_NORMAL} />
            <div className={styles.CommandPaletteItem__ItemContent}>
                <span className={styles.CommandPaletteItem__LabelLine}>
                    Go to Settings
                </span>
            </div>
        </Command.Item>
    )

    const helpGuideItem = (
        <Command.Item
            value="help guide"
            className={styles.CommandPaletteItem__Item}
            onSelect={() => handleNavigation(navigateToHelp)}
        >
            <IconHelp {...ICON_PROPS_NORMAL} />
            <div className={styles.CommandPaletteItem__ItemContent}>
                <span className={styles.CommandPaletteItem__LabelLine}>
                    Help Guide
                </span>
            </div>
        </Command.Item>
    )

    const navigationGroup = (
        <Command.Group
            heading={
                <span className={styles.CommandPaletteGroup__Heading}>
                    Navigation
                </span>
            }
            className={styles.CommandPaletteGroup__Group}
        >
            {goToJotItem}
            {goToCollectionsItem}
            {goToSettingsItem}
            {helpGuideItem}
        </Command.Group>
    )

    const massTagEditItem =
        isOnJotPage && mainListVisibleItems.length > 0 ? (
            <Command.Item
                value="mass edit tags"
                className={styles.CommandPaletteItem__Item}
                onSelect={() => {
                    openMassTagEditDialog({
                        items: mainListVisibleItems,
                        onSave: (tagStr, mode) =>
                            massTagEditMutation.mutate({
                                items: mainListVisibleItems,
                                tagStr,
                                mode,
                            }),
                    })
                    onClose()
                }}
            >
                <IconTags {...ICON_PROPS_NORMAL} />
                <div className={styles.CommandPaletteItem__ItemContent}>
                    <span className={styles.CommandPaletteItem__LabelLine}>
                        Mass edit tags
                    </span>
                    <span className={styles.CommandPaletteItem__SubLabel}>
                        {mainListVisibleItems.length} currently visible items
                    </span>
                </div>
            </Command.Item>
        ) : null

    const changeThemeItem = (
        <Command.Item
            value="change theme"
            className={styles.CommandPaletteItem__Item}
            onSelect={() => onModeChange("theme")}
        >
            <IconPalette {...ICON_PROPS_NORMAL} />
            <div className={styles.CommandPaletteItem__ItemContent}>
                <span className={styles.CommandPaletteItem__LabelLine}>
                    Change Theme...
                </span>
            </div>
        </Command.Item>
    )

    const actionsGroup = (
        <Command.Group
            heading={
                <span className={styles.CommandPaletteGroup__Heading}>
                    Actions
                </span>
            }
            className={styles.CommandPaletteGroup__Group}
        >
            {massTagEditItem}
            {changeThemeItem}
        </Command.Group>
    )

    const handleThemePreview = (themeName: ThemeName) => {
        if (!isThemeMode) return
        setTheme(themeName)
    }

    const themeGroup = (
        <Command.Group className={styles.CommandPaletteGroup__Group}>
            {themes.map((theme) => (
                <Command.Item
                    key={theme.name}
                    value={theme.name}
                    className={styles.CommandPaletteItem__Item}
                    onMouseEnter={() =>
                        handleThemePreview(theme.name as ThemeName)
                    }
                    onSelect={() => handleThemeSelect(theme.name as ThemeName)}
                >
                    <div className={styles.CommandPaletteItem__ItemContent}>
                        <span className={styles.CommandPaletteItem__LabelLine}>
                            {theme.name}
                        </span>
                    </div>
                    {theme.name === originalThemeRef.current && (
                        <span className={styles.CommandPaletteItem__Check}>
                            <IconCheck {...ICON_PROPS_NORMAL} />
                        </span>
                    )}
                    <div
                        className={styles.ThemeColourPreview}
                        style={{ backgroundColor: theme.colBg }}
                    >
                        <div
                            className={styles.ThemeColourPreview__Block}
                            style={{ backgroundColor: theme.colMain }}
                        />
                        <div
                            className={styles.ThemeColourPreview__Block}
                            style={{ backgroundColor: theme.colSub }}
                        />
                        <div
                            className={styles.ThemeColourPreview__Block}
                            style={{ backgroundColor: theme.colText }}
                        />
                    </div>
                </Command.Item>
            ))}
        </Command.Group>
    )

    return (
        <Dialog.Content
            className={styles.CommandPalette__Content}
            aria-describedby={undefined}
            onInteractOutside={revertThemePreview}
            onOpenAutoFocus={(e) => {
                if (window.matchMedia("(hover: none)").matches) {
                    e.preventDefault()
                }
            }}
            onCloseAutoFocus={() => {
                if (isThemeMode && !didCommitThemeSelection.current) {
                    revertThemePreview()
                }
                didCommitThemeSelection.current = false
            }}
        >
            <Dialog.Title className="VisuallyHidden">
                Command Palette
            </Dialog.Title>
            <Command
                label="Command palette"
                value={isThemeMode ? currentTheme : undefined}
                // Hacky implementation: force clearing search query upon mode switch
                // cmdk unfortunately doesn't expose the search state for external control
                key={mode}
                onValueChange={(value) => {
                    if (isThemeMode && value) {
                        handleThemePreview(value as ThemeName)
                    }
                }}
            >
                <Command.Input
                    className={styles.CommandPalette__Input}
                    placeholder={searchPlaceholder}
                />
                <Command.List
                    ref={listRef}
                    className={styles.CommandPaletteList__List}
                >
                    <Command.Empty className={styles.CommandPaletteList__Empty}>
                        No results found.
                    </Command.Empty>

                    {isMainMode ? (
                        <>
                            {collectionsGroup}
                            {collectionActionsGroup}
                            {navigationGroup}
                            {actionsGroup}
                        </>
                    ) : (
                        themeGroup
                    )}
                </Command.List>
            </Command>
        </Dialog.Content>
    )
}
