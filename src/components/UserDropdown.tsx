import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import {
    IconChevronDown,
    IconSettings,
    IconStack2,
    IconHelp,
    IconWritingSign,
    IconKeyboard,
} from "@tabler/icons-react"
import { useDropdownFocusCleanup } from "@/hooks/useDropdownFocusCleanup"
import { useSyncedUserSettings } from "@/store/syncedUserSettings"
import { useNavigateRoutes } from "@/hooks/useNavigateRoutes"
import { openShortcutDialog } from "@/utils/openShortcutDialog"
import {
    DEFAULT_USERNAME,
    DROPDOWN_OFFSET,
    ICON_PROPS_ITEM_DROPDOWN,
    ROUTE_COLLECTION,
    ROUTE_JOT,
} from "@/config/constants"
import styles from "./UserDropdown.module.scss"
import { useMatch } from "react-router-dom"

export default function UserDropdown() {
    const userDisplayName =
        useSyncedUserSettings((s) => s.userDisplayName) || DEFAULT_USERNAME
    const {
        navigateToJot,
        navigateToSettings,
        navigateToCollections,
        navigateToHelp,
    } = useNavigateRoutes()

    const { triggerPointerDown, triggerKeyDown, contentCloseAutoFocus } =
        useDropdownFocusCleanup()
    const isJotRoute = useMatch(ROUTE_JOT)
    const isJotCollectionRoute = useMatch(ROUTE_COLLECTION)
    const shouldShowJotNav = !isJotRoute && !isJotCollectionRoute

    return (
        <div className={styles.UserDropdown}>
            <DropdownMenu.Root>
                <DropdownMenu.Trigger
                    className={styles.UserDropdown__Trigger}
                    onPointerDown={triggerPointerDown}
                    onKeyDown={triggerKeyDown}
                >
                    <span className={styles.UserDropdown__TriggerLabel}>
                        {userDisplayName}
                    </span>
                    <IconChevronDown
                        {...ICON_PROPS_ITEM_DROPDOWN}
                        className={styles.UserDropdown__Chevron}
                    />
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                    <DropdownMenu.Content
                        className={styles.UserDropdown__Content}
                        align="end"
                        sideOffset={DROPDOWN_OFFSET}
                        onCloseAutoFocus={contentCloseAutoFocus}
                    >
                        {shouldShowJotNav && (
                            <>
                                <DropdownMenu.Item
                                    className={styles.UserDropdown__Item}
                                    onSelect={navigateToJot}
                                >
                                    <IconWritingSign
                                        {...ICON_PROPS_ITEM_DROPDOWN}
                                    />
                                    Jot
                                </DropdownMenu.Item>
                                <DropdownMenu.Separator
                                    className={styles.UserDropdown__Separator}
                                />
                            </>
                        )}
                        <DropdownMenu.Item
                            className={styles.UserDropdown__Item}
                            onSelect={navigateToSettings}
                        >
                            <IconSettings {...ICON_PROPS_ITEM_DROPDOWN} />
                            Settings
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                            className={styles.UserDropdown__Item}
                            onSelect={navigateToCollections}
                        >
                            <IconStack2 {...ICON_PROPS_ITEM_DROPDOWN} />
                            Collections
                        </DropdownMenu.Item>
                        <DropdownMenu.Separator
                            className={styles.UserDropdown__Separator}
                        />
                        <DropdownMenu.Item
                            className={styles.UserDropdown__Item}
                            onSelect={openShortcutDialog}
                        >
                            <IconKeyboard {...ICON_PROPS_ITEM_DROPDOWN} />
                            Shortcuts
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                            className={styles.UserDropdown__Item}
                            onSelect={navigateToHelp}
                        >
                            <IconHelp {...ICON_PROPS_ITEM_DROPDOWN} />
                            Help
                        </DropdownMenu.Item>
                    </DropdownMenu.Content>
                </DropdownMenu.Portal>
            </DropdownMenu.Root>
        </div>
    )
}
