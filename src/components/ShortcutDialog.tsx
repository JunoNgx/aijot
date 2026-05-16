import type { ReactNode } from "react"
import { IconX } from "@tabler/icons-react"
import { useDialogStore } from "@/store/dialogStore"
import { parseShortcut } from "@/utils/helpers"
import {
    SHORTCUT_FOCUS_MAIN_INPUT,
    SHORTCUT_CMD_PAL,
    SHORTCUT_CMD_PAL_ALT,
    SHORTCUT_CMD_PAL_THEME,
    SHORTCUT_NAV_UP,
    SHORTCUT_NAV_DOWN,
    SHORTCUT_NAV_UP_SKIP,
    SHORTCUT_NAV_DOWN_SKIP,
    SHORTCUT_NAV_TOP,
    SHORTCUT_NAV_BOTTOM,
    SHORTCUT_NAV_ACTION,
    SHORTCUT_ITEM_EDIT,
    SHORTCUT_ITEM_COPY,
    SHORTCUT_ITEM_TRASH,
    SHORTCUT_ITEM_RESTORE,
    SHORTCUT_ITEM_TOGGLE_COPY_ON_CLICK,
    SHORTCUT_ITEM_REFETCH,
    SHORTCUT_ITEM_CONVERT_TO_TODO,
    SHORTCUT_SAVE_AND_CLOSE,
    SHORTCUT_SHORTCUTS_HELP,
    SHORTCUT_SYNC,
    SHORTCUT_TOGGLE_ITEM_EXPANDED_MODE,
    SHORTCUT_NAV_PREV_COLLECTION,
    SHORTCUT_NAV_NEXT_COLLECTION,
    SHORTCUT_MASS_TAG_EDIT,
    SHORTCUT_DISMISS_ALL_NOTIFICATIONS,
} from "@/config/constants"
import "./ShortcutDialog.scss"

interface ShortcutItemProps {
    shortcut: string
    description: string
    shortcutAlt?: string
}

function ShortcutCombo({ shortcut }: { shortcut: string }) {
    const keys = parseShortcut(shortcut)
    return (
        <span className="ShortcutCombo">
            {keys.map((key, index) => (
                <span key={index} className="ShortcutCombo__KeyWrapper">
                    <kbd>{key}</kbd>
                    {index < keys.length - 1 && (
                        <span className="ShortcutCombo__Plus">+</span>
                    )}
                </span>
            ))}
        </span>
    )
}

function ShortcutItem({
    shortcut,
    description,
    shortcutAlt,
}: ShortcutItemProps) {
    return (
        <div className="ShortcutItem">
            <div className="ShortcutItem__Keys">
                <ShortcutCombo shortcut={shortcut} />
                {shortcutAlt && (
                    <>
                        <span className="ShortcutItem__Or">or</span>
                        <ShortcutCombo shortcut={shortcutAlt} />
                    </>
                )}
            </div>
            <span className="ShortcutItem__Desc">{description}</span>
        </div>
    )
}

interface ShortcutSectionProps {
    title: string
    note?: string
    children: ReactNode
}

function ShortcutSection({ title, note, children }: ShortcutSectionProps) {
    return (
        <section className="ShortcutSection">
            <h3 className="ShortcutSection__Title">{title}</h3>
            {note && <p className="ShortcutSection__Note">{note}</p>}
            <div className="ShortcutSection__Grid">{children}</div>
        </section>
    )
}

export default function ShortcutDialog() {
    const closeAllDialogs = useDialogStore((s) => s.closeAllDialogs)

    return (
        <div className="ShortcutDialog">
            <div className="ShortcutDialog__Header">
                <h2 className="ShortcutDialog__Title">Hotkey shortcuts</h2>
                <button
                    className="ShortcutDialog__CloseBtn"
                    onClick={closeAllDialogs}
                    type="button"
                    aria-label="Close"
                >
                    <IconX size={20} strokeWidth={2} />
                </button>
            </div>

            <div className="ShortcutDialog__Sections">
                <ShortcutSection title="Navigation">
                    <ShortcutItem
                        shortcut={SHORTCUT_NAV_UP}
                        description="Previous"
                    />
                    <ShortcutItem
                        shortcut={SHORTCUT_NAV_DOWN}
                        description="Next"
                    />
                    <ShortcutItem
                        shortcut={SHORTCUT_NAV_UP_SKIP}
                        description="Skip 5 up"
                    />
                    <ShortcutItem
                        shortcut={SHORTCUT_NAV_DOWN_SKIP}
                        description="Skip 5 down"
                    />
                    <ShortcutItem
                        shortcut={SHORTCUT_NAV_TOP}
                        description="First"
                    />
                    <ShortcutItem
                        shortcut={SHORTCUT_NAV_BOTTOM}
                        description="Last"
                    />
                    <ShortcutItem
                        shortcut={SHORTCUT_NAV_ACTION}
                        description="Primary action"
                    />
                    <ShortcutItem
                        shortcut="Escape"
                        description="Clear selection"
                    />
                </ShortcutSection>

                <ShortcutSection title="Item Actions">
                    <ShortcutItem
                        shortcut={SHORTCUT_ITEM_EDIT}
                        description="Edit"
                    />
                    <ShortcutItem
                        shortcut={SHORTCUT_ITEM_COPY}
                        description="Copy content"
                    />
                    <ShortcutItem
                        shortcut={SHORTCUT_ITEM_TRASH}
                        description="Trash"
                    />
                    <ShortcutItem
                        shortcut={SHORTCUT_ITEM_RESTORE}
                        description="Restore"
                    />
                    <ShortcutItem
                        shortcut={SHORTCUT_ITEM_TOGGLE_COPY_ON_CLICK}
                        description="Toggle copy-on-click"
                    />
                    <ShortcutItem
                        shortcut={SHORTCUT_ITEM_REFETCH}
                        description="Refetch link (links only)"
                    />
                    <ShortcutItem
                        shortcut={SHORTCUT_ITEM_CONVERT_TO_TODO}
                        description="Convert to todo (text only)"
                    />
                </ShortcutSection>

                <ShortcutSection title="App">
                    <ShortcutItem
                        shortcut={SHORTCUT_FOCUS_MAIN_INPUT}
                        description="Focus input"
                    />
                    <ShortcutItem
                        shortcut={SHORTCUT_CMD_PAL}
                        shortcutAlt={SHORTCUT_CMD_PAL_ALT}
                        description="Command palette"
                    />
                    <ShortcutItem
                        shortcut={SHORTCUT_CMD_PAL_THEME}
                        description="Theme switch palette"
                    />
                    <ShortcutItem
                        shortcut={SHORTCUT_SAVE_AND_CLOSE}
                        description="Save and close (editor)"
                    />
                    <ShortcutItem
                        shortcut={SHORTCUT_SYNC}
                        description="Sync to Google Drive"
                    />
                    <ShortcutItem
                        shortcut={SHORTCUT_SHORTCUTS_HELP}
                        description="Show shortcuts"
                    />
                    <ShortcutItem
                        shortcut={SHORTCUT_TOGGLE_ITEM_EXPANDED_MODE}
                        description="Toggle expanded item info"
                    />
                    <ShortcutItem
                        shortcut={SHORTCUT_MASS_TAG_EDIT}
                        description="Mass edit tags (Jot page)"
                    />
                    <ShortcutItem
                        shortcut={SHORTCUT_DISMISS_ALL_NOTIFICATIONS}
                        description="Dismiss all notifications"
                    />
                </ShortcutSection>

                <ShortcutSection
                    title="Collections"
                    note="Requires the main input to be unfocused."
                >
                    <ShortcutItem
                        shortcut={SHORTCUT_NAV_PREV_COLLECTION}
                        description="Previous collection"
                    />
                    <ShortcutItem
                        shortcut={SHORTCUT_NAV_NEXT_COLLECTION}
                        description="Next collection"
                    />
                    <ShortcutItem
                        shortcut="mod+n"
                        description="Jump to collection n (1-9)"
                    />
                </ShortcutSection>
            </div>
        </div>
    )
}
