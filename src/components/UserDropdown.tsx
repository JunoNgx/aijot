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
import "./UserDropdown.scss"
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
        <div className="UserDropdown">
            <DropdownMenu.Root>
                <DropdownMenu.Trigger
                    className="UserDropdown__Trigger"
                    onPointerDown={triggerPointerDown}
                    onKeyDown={triggerKeyDown}
                >
                    <span className="UserDropdown__TriggerLabel">
                        {userDisplayName}
                    </span>
                    <IconChevronDown
                        {...ICON_PROPS_ITEM_DROPDOWN}
                        className="UserDropdown__Chevron"
                    />
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                    <DropdownMenu.Content
                        className="UserDropdown__Content"
                        align="end"
                        sideOffset={DROPDOWN_OFFSET}
                        onCloseAutoFocus={contentCloseAutoFocus}
                    >
                        {shouldShowJotNav && (
                            <>
                                <DropdownMenu.Item
                                    className="UserDropdown__Item"
                                    onSelect={navigateToJot}
                                >
                                    <IconWritingSign
                                        {...ICON_PROPS_ITEM_DROPDOWN}
                                    />
                                    Jot
                                </DropdownMenu.Item>
                                <DropdownMenu.Separator className="UserDropdown__Separator" />
                            </>
                        )}
                        <DropdownMenu.Item
                            className="UserDropdown__Item"
                            onSelect={navigateToSettings}
                        >
                            <IconSettings {...ICON_PROPS_ITEM_DROPDOWN} />
                            Settings
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                            className="UserDropdown__Item"
                            onSelect={navigateToCollections}
                        >
                            <IconStack2 {...ICON_PROPS_ITEM_DROPDOWN} />
                            Collections
                        </DropdownMenu.Item>
                        <DropdownMenu.Separator className="UserDropdown__Separator" />
                        <DropdownMenu.Item
                            className="UserDropdown__Item"
                            onSelect={openShortcutDialog}
                        >
                            <IconKeyboard {...ICON_PROPS_ITEM_DROPDOWN} />
                            Shortcuts
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                            className="UserDropdown__Item"
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
