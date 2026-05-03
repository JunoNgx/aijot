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
} from "@/config/constants"
import styles from "./ShortcutDialog.module.scss"

interface ShortcutItemProps {
    shortcut: string
    description: string
    shortcutAlt?: string
}

function ShortcutCombo({ shortcut }: { shortcut: string }) {
    const keys = parseShortcut(shortcut)
    return (
        <span className={styles.ShortcutDialog__Combo}>
            {keys.map((key, index) => (
                <span key={index} className={styles.ShortcutDialog__KeyWrapper}>
                    <kbd>{key}</kbd>
                    {index < keys.length - 1 && (
                        <span className={styles.ShortcutDialog__Plus}>+</span>
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
        <div className={styles.ShortcutDialog__Item}>
            <div className={styles.ShortcutDialog__Keys}>
                <ShortcutCombo shortcut={shortcut} />
                {shortcutAlt && (
                    <>
                        <span className={styles.ShortcutDialog__Or}>or</span>
                        <ShortcutCombo shortcut={shortcutAlt} />
                    </>
                )}
            </div>
            <span className={styles.ShortcutDialog__Desc}>{description}</span>
        </div>
    )
}

export default function ShortcutDialog() {
    const closeAllDialogs = useDialogStore((s) => s.closeAllDialogs)

    return (
        <div className={styles.ShortcutDialog}>
            <div className={styles.ShortcutDialog__Header}>
                <h2 className={styles.ShortcutDialog__Title}>
                    Hotkey shortcuts
                </h2>
                <button
                    className="Btn Btn--Icon"
                    onClick={closeAllDialogs}
                    type="button"
                    aria-label="Close"
                >
                    <IconX size={20} strokeWidth={2} />
                </button>
            </div>

            <div className={styles.ShortcutDialog__Sections}>
                <section className={styles.ShortcutDialog__Section}>
                    <h3 className={styles.ShortcutDialog__SectionTitle}>
                        Navigation
                    </h3>
                    <div className={styles.ShortcutDialog__Grid}>
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
                    </div>
                </section>

                <section className={styles.ShortcutDialog__Section}>
                    <h3 className={styles.ShortcutDialog__SectionTitle}>
                        Item Actions
                    </h3>
                    <div className={styles.ShortcutDialog__Grid}>
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
                    </div>
                </section>

                <section className={styles.ShortcutDialog__Section}>
                    <h3 className={styles.ShortcutDialog__SectionTitle}>App</h3>
                    <div className={styles.ShortcutDialog__Grid}>
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
                    </div>
                </section>

                <section className={styles.ShortcutDialog__Section}>
                    <h3 className={styles.ShortcutDialog__SectionTitle}>
                        Collections
                    </h3>
                    <p className={styles.ShortcutDialog__SectionNote}>
                        Requires the main input to be unfocused.
                    </p>
                    <div className={styles.ShortcutDialog__Grid}>
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
                    </div>
                </section>
            </div>
        </div>
    )
}
