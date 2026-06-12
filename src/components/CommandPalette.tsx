import { useState, useRef, useEffect } from "react"
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
import type { ReactNode } from "react"
import "./CommandPalette.scss"
import { ICON_PROPS_NORMAL, ROUTE_JOT } from "@/config/constants"

interface CommandPaletteItemProps {
    value: string
    onSelect: () => void
    icon: ReactNode
    label: string
    subLabel?: string
}

function CommandPaletteItem({
    value,
    onSelect,
    icon,
    label,
    subLabel,
}: CommandPaletteItemProps) {
    return (
        <Command.Item
            value={value}
            className="CommandPaletteItem__Item"
            onSelect={onSelect}
        >
            {icon}
            <div className="CommandPaletteItem__ItemContent">
                <span className="CommandPaletteItem__LabelLine">{label}</span>
                {subLabel && (
                    <span className="CommandPaletteItem__SubLabel">
                        {subLabel}
                    </span>
                )}
            </div>
        </Command.Item>
    )
}
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
    const [originalTheme] = useState(currentTheme)
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
        setTheme(originalTheme)
    }

    const handleEditCurrentCollection = () => {
        const collection = collections.find((c) => c.slug === currentSlug)
        if (collection) {
            handleNavigation(() => openCollectionDialog(collection))
        }
    }

    const handleMassTagEdit = () => {
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
    }

    const handleCloseAutoFocus = () => {
        if (isThemeMode && !didCommitThemeSelection.current) {
            revertThemePreview()
        }
        didCommitThemeSelection.current = false
    }

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
                <span className="CommandPaletteGroup__Heading">
                    Collections
                </span>
            }
            className="CommandPaletteGroup__Group"
        >
            {collections.map((collection) => (
                <CommandPaletteItem
                    key={collection.slug}
                    value={`${collection.name} ${collection.slug}`}
                    onSelect={() =>
                        handleNavigation(() =>
                            navigateToCollection(collection.slug),
                        )
                    }
                    icon={<span>{collection.icon}</span>}
                    label={collection.name}
                    subLabel={`/${collection.slug}`}
                />
            ))}
        </Command.Group>
    )

    const createCollectionItem = (
        <CommandPaletteItem
            value="create collection"
            onSelect={() => handleNavigation(() => openCollectionDialog())}
            icon={<IconPlus {...ICON_PROPS_NORMAL} />}
            label="Create new collection"
        />
    )

    const setDefaultItem = shouldIncludeSetDefaultAction && (
        <CommandPaletteItem
            value={`set ${currentSlug} as default`}
            onSelect={() =>
                handleNavigation(() => setDefaultCollectionSlug(currentSlug!))
            }
            icon={<IconCheck {...ICON_PROPS_NORMAL} />}
            label={`Set "${currentSlug}" as default`}
        />
    )

    const editCollectionItem = isInCollection && (
        <CommandPaletteItem
            value="edit current collection"
            onSelect={handleEditCurrentCollection}
            icon={<IconSettings {...ICON_PROPS_NORMAL} />}
            label="Edit current collection"
        />
    )

    const collectionActionsGroup = (
        <Command.Group
            heading={
                <span className="CommandPaletteGroup__Heading">
                    Collection Actions
                </span>
            }
            className="CommandPaletteGroup__Group"
        >
            {createCollectionItem}
            {setDefaultItem}
            {editCollectionItem}
        </Command.Group>
    )

    const goToJotItem = (
        <CommandPaletteItem
            value="go to jot"
            onSelect={() => handleNavigation(navigateToJot)}
            icon={<IconWritingSign {...ICON_PROPS_NORMAL} />}
            label="Go to Jot Items"
        />
    )

    const goToCollectionsItem = (
        <CommandPaletteItem
            value="go to collections"
            onSelect={() => handleNavigation(navigateToCollections)}
            icon={<IconStack2 {...ICON_PROPS_NORMAL} />}
            label="Go to Manage Collections"
        />
    )

    const goToSettingsItem = (
        <CommandPaletteItem
            value="go to settings"
            onSelect={() => handleNavigation(navigateToSettings)}
            icon={<IconSettings {...ICON_PROPS_NORMAL} />}
            label="Go to Settings"
        />
    )

    const helpGuideItem = (
        <CommandPaletteItem
            value="help guide"
            onSelect={() => handleNavigation(navigateToHelp)}
            icon={<IconHelp {...ICON_PROPS_NORMAL} />}
            label="Help Guide"
        />
    )

    const navigationGroup = (
        <Command.Group
            heading={
                <span className="CommandPaletteGroup__Heading">Navigation</span>
            }
            className="CommandPaletteGroup__Group"
        >
            {goToJotItem}
            {goToCollectionsItem}
            {goToSettingsItem}
            {helpGuideItem}
        </Command.Group>
    )

    const massTagEditItem =
        isOnJotPage && mainListVisibleItems.length > 0 ? (
            <CommandPaletteItem
                value="mass edit tags"
                onSelect={handleMassTagEdit}
                icon={<IconTags {...ICON_PROPS_NORMAL} />}
                label="Mass edit tags"
                subLabel={`${mainListVisibleItems.length} currently visible items`}
            />
        ) : null

    const changeThemeItem = (
        <CommandPaletteItem
            value="change theme"
            onSelect={() => onModeChange("theme")}
            icon={<IconPalette {...ICON_PROPS_NORMAL} />}
            label="Change Theme..."
        />
    )

    const actionsGroup = (
        <Command.Group
            heading={
                <span className="CommandPaletteGroup__Heading">Actions</span>
            }
            className="CommandPaletteGroup__Group"
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
        <Command.Group className="CommandPaletteGroup__Group">
            {themes.map((theme) => (
                <Command.Item
                    key={theme.name}
                    value={theme.name}
                    className="CommandPaletteItem__Item"
                    onMouseEnter={() =>
                        handleThemePreview(theme.name as ThemeName)
                    }
                    onSelect={() => handleThemeSelect(theme.name as ThemeName)}
                >
                    <div className="CommandPaletteItem__ItemContent">
                        <span className="CommandPaletteItem__LabelLine">
                            {theme.name}
                        </span>
                    </div>
                    {theme.name === originalTheme && (
                        <span className="CommandPaletteItem__Check">
                            <IconCheck {...ICON_PROPS_NORMAL} />
                        </span>
                    )}
                    <div
                        className="ThemeColourPreview"
                        style={{ backgroundColor: theme.colBg }}
                    >
                        <div
                            className="ThemeColourPreview__Block"
                            style={{ backgroundColor: theme.colMain }}
                        />
                        <div
                            className="ThemeColourPreview__Block"
                            style={{ backgroundColor: theme.colSub }}
                        />
                        <div
                            className="ThemeColourPreview__Block"
                            style={{ backgroundColor: theme.colText }}
                        />
                    </div>
                </Command.Item>
            ))}
        </Command.Group>
    )

    return (
        <>
            <Dialog.Overlay
                className={
                    isThemeMode
                        ? "CommandPalette__Overlay CommandPalette__Overlay--NoBlur"
                        : "CommandPalette__Overlay"
                }
            />
            <Dialog.Content
                className="CommandPalette__Content"
                aria-describedby={undefined}
                onInteractOutside={revertThemePreview}
                onOpenAutoFocus={(e) => {
                    if (window.matchMedia("(hover: none)").matches) {
                        e.preventDefault()
                    }
                }}
                onCloseAutoFocus={handleCloseAutoFocus}
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
                        className="CommandPalette__Input"
                        placeholder={searchPlaceholder}
                    />
                    <Command.List
                        ref={listRef}
                        className="CommandPaletteList__List"
                    >
                        <Command.Empty className="CommandPaletteList__Empty">
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
        </>
    )
}
