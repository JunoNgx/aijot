import { DateTime } from "luxon"
import type { CoreCollectionConfig } from "@/types"

const CORE_COLLECTION_INIT_TIME = DateTime.now().toUTC().toISO()

// ============================================================
// App
// ============================================================

export const APP_VERSION = "0.9.0"
export const COMMIT_SHA = import.meta.env.VERCEL_GIT_COMMIT_SHA

export const DB_VERSION = 1

export const TRASH_PURGE_DURATION_DAY = 7
export const SOFT_DELETE_PURGE_DURATION_DAY = 60

export const BACKEND_URL = "https://api.aijot.app"
// export const BACKEND_URL = "http://localhost:3000"

export const DEFAULT_USERNAME = "David"

// ============================================================
// Icon props
// ============================================================

export const ICON_PROPS_HEADER = {
    size: 20,
    strokeWidth: 2,
}

export const ICON_PROPS_NORMAL = {
    size: 16,
    strokeWidth: 2,
}

export const ICON_PROPS_ITEM_DROPDOWN = {
    size: 16,
    strokeWidth: 2,
}

export const ICON_PROPS_ACTION = {
    size: 20,
    strokeWidth: 2,
}

export const ICON_PROPS_BUTTON = {
    size: 20,
    strokeWidth: 2,
}

export const ICON_PROPS_ITEM_ICON = {
    size: 24,
    strokeWidth: 2,
}

export const ICON_PROPS_CURR_COLLECTION = {
    size: 20,
    strokeWidth: 2,
}

export const ICON_PROPS_ITEM_STATUS = {
    size: 16,
    strokeWidth: 2,
}

// ============================================================
// Misc UI values
// ============================================================

export const DROPDOWN_OFFSET = 10

// ============================================================
// Display limits
// ============================================================

export const JOT_ITEM_COMPACT_TEXT_DISPLAY_LIMIT = 80
export const JOT_ITEM_EXPANDED_TEXT_DISPLAY_LIMIT = 120

export const REDACTED_PLACEHOLDER = "■■■■■■■■"

// ============================================================
// Routes
// ============================================================

export const ROUTE_JOT = "/jot"
export const ROUTE_COLLECTION = "/jot/:slug"
export const ROUTE_COLLECTIONS = "/collections"
export const ROUTE_SETTINGS = "/settings"
export const ROUTE_HELP = "/help"
export const ROUTE_PRIVACY = "/privacy"
export const ROUTE_TERMS = "/terms"

// ============================================================
// Core collections
// ============================================================

export const DEFAULT_ALL_COLLECTION: CoreCollectionConfig = {
    name: "Everything",
    slug: "all",
    icon: "📦",
    sortOrder: 0,
    createdAt: CORE_COLLECTION_INIT_TIME,
    updatedAt: CORE_COLLECTION_INIT_TIME,
}

export const DEFAULT_UNTAGGED_COLLECTION: CoreCollectionConfig = {
    name: "Untagged",
    slug: "untagged",
    icon: "🏷️",
    sortOrder: 1,
    createdAt: CORE_COLLECTION_INIT_TIME,
    updatedAt: CORE_COLLECTION_INIT_TIME,
}

export const DEFAULT_TRASH_COLLECTION: CoreCollectionConfig = {
    name: "Trash",
    slug: "trash",
    icon: "🗑️",
    sortOrder: 2,
    createdAt: CORE_COLLECTION_INIT_TIME,
    updatedAt: CORE_COLLECTION_INIT_TIME,
}

// ============================================================
// Keyboard shortcuts
// ============================================================

// Format: "mod+key", "shift+key", "mod+shift+key"
// mod = Ctrl on Windows/Linux, Cmd on Mac

export const SHORTCUT_CMD_PAL = "mod+k"
export const SHORTCUT_CMD_PAL_ALT = "mod+p"
export const SHORTCUT_CMD_PAL_THEME = "alt+t"
export const SHORTCUT_FOCUS_MAIN_INPUT = "mod+f"

export const SHORTCUT_ITEM_EDIT = "mod+e"
export const SHORTCUT_ITEM_TRASH = "mod+shift+backspace"
export const SHORTCUT_ITEM_RESTORE = "mod+alt+r"
export const SHORTCUT_ITEM_COPY = "mod+shift+c"
export const SHORTCUT_ITEM_TOGGLE_COPY_ON_CLICK = "mod+alt+4"
export const SHORTCUT_ITEM_REFETCH = "mod+alt+5"
export const SHORTCUT_ITEM_CONVERT_TO_TODO = "mod+alt+6"

export const SHORTCUT_SAVE_AND_CLOSE = "mod+s"
export const SHORTCUT_SYNC = "mod+s"
export const SHORTCUT_SHORTCUTS_HELP = "mod+Slash"
export const SHORTCUT_TOGGLE_ITEM_EXPANDED_MODE = "mod+backslash"
export const SHORTCUT_MASS_TAG_EDIT = "mod+alt+E"
export const SHORTCUT_DISMISS_ALL_NOTIFICATIONS = "mod+shift+x"

export const SHORTCUT_NAV_UP = "ArrowUp"
export const SHORTCUT_NAV_DOWN = "ArrowDown"
export const SHORTCUT_NAV_UP_SKIP = "shift+ArrowUp"
export const SHORTCUT_NAV_DOWN_SKIP = "shift+ArrowDown"
export const SHORTCUT_NAV_TOP = "mod+shift+ArrowUp"
export const SHORTCUT_NAV_BOTTOM = "mod+shift+ArrowDown"
export const SHORTCUT_NAV_SUBMIT = "Enter"
export const SHORTCUT_NAV_ACTION = "mod+Enter"
export const SHORTCUT_NAV_PREV_COLLECTION = "ArrowLeft"
export const SHORTCUT_NAV_NEXT_COLLECTION = "ArrowRight"

export const COLLECTION_HOTKEY_COUNT = 9

// ============================================================
// Input syntax prefixes
// ============================================================

export const SYNTAX_PREFIX_TODO = ":td:"
export const SYNTAX_PREFIX_LONG_TEXT = ":t:"

// Creation flags (suffixed after content)
export const SYNTAX_FLAG_TAG = "::tg"
export const SYNTAX_FLAG_COLLECTION = "::col"
export const SYNTAX_FLAG_COMMON_PREFIX = "::"

// Browse/filter syntax
export const SYNTAX_FILTER_TYPE_TEXT = "::t::"
export const SYNTAX_FILTER_TYPE_LINK = "::link::"
export const SYNTAX_FILTER_TYPE_TODO = "::td::"
export const SYNTAX_FILTER_TYPE_INCOMPLETE_TODO = "::itd::"
export const SYNTAX_FILTER_TYPE_COMPLETED_TODO = "::ctd::"
export const SYNTAX_SEARCH_TAG_PREFIX = "##"
