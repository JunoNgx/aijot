import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import {
    IconChevronDown,
    IconSettings,
    IconStack2,
    IconHelp,
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
} from "@/config/constants"
import "./UserDropdown.scss"

export default function UserDropdown() {
    const userDisplayName =
        useSyncedUserSettings((s) => s.userDisplayName) || DEFAULT_USERNAME
    const { navigateToSettings, navigateToCollections, navigateToHelp } =
        useNavigateRoutes()

    const { triggerPointerDown, triggerKeyDown, contentCloseAutoFocus } =
        useDropdownFocusCleanup()

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
