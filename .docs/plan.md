# aijot-frontend — Implementation Plan

## Task 1 — Project scaffold

- [x] Init Vite + React + TypeScript
- [x] Set up yarn v4 with node-modules linker
- [x] Install all dependencies
- [x] `postcss.config.cjs` for Mantine
- [x] `vite.config.ts` with PWA plugin
- [x] `src/styles/global.scss`
- [x] `src/theme.ts`
- [x] `src/types.ts`
- [x] `src/constants/misc.ts`
- [x] `src/constants/coreCollections.ts`
- [x] `src/constants/keyboardShortcuts.ts`
- [x] `src/main.tsx` with all providers
- [x] `src/App.tsx` stub with routes and purge trigger
- [x] `src/db/storage.interface.ts`
- [x] `src/db/dexie.adapter.ts`
- [x] `src/db/index.ts` — platform factory + `purgeExpiredItems`

---

## Task 2 — Zustand: localUserSettings

- [x] `src/store/localUserSettings.ts`
- [x] persist to localStorage

## Task 3 — Zustand: localAppData

- [x] `src/store/localAppData.ts`
- [x] persist to localStorage

## Task 4 — Zustand: localSyncData

- [x] `src/store/localSyncData.ts`
- [x] persist to localStorage

## Task 5 — Zustand: profileSettings

- [x] `src/store/profileSettings.ts`
- [x] persist to localStorage

## Task 6 — Zustand: coreCollectionSettings

- [x] `src/store/coreCollectionSettings.ts`
- [x] seed defaults from `src/constants/coreCollections.ts`
- [x] persist to localStorage

## Task 7 — Zustand: store index

- [won't do] `src/store/index.ts` — re-export all stores

---

## Task 8 — Utils

- [x] `src/utils/slugGenerator.ts` — string to kebab-case
- [x] `src/utils/dateFormatter.ts` — month+day; year if older than 1yr
- [x] `src/utils/hexColour.ts` — `isValidHexColourCode(str)` checks last 7 chars

---

## Task 9 — Items query layer

- [x] `src/db/queryKeys.ts` — centralised query key constants
- [x] `useItemsQuery` — non-deleted items, jottedAt desc, pinned first
- [x] `useCreateItemMutation` — optimistic insert with `isPending: true`

---

## Task 10 — useCoreCollections + collections query

- [x] `useCoreCollections` — builds 3 virtual collections from store with `coreType`
- [x] `useCollectionsQuery` — DB collections + core collections appended

---

## Task 11 — JotItem component

- [x] layout: icon, primary text, secondary text, datetime
- [x] icon variants: note, hex swatch, checkbox, favicon with fallback
- [x] primary text: title for text/link; content for todo
- [x] secondary text: content for text/link
- [x] datetime via `dateFormatter`
- [x] click: primary action or copy if `shouldCopyOnClick`

---

## Task 12 — Jot page MVP

- [x] Combobox input with inline parsing
- [x] creation: Enter submits, routes by parsed type, tag resolution, guard in trash
- [x] item list via `useItemsQuery`
- [x] plain text search + type/tag filters applied to list

---

## Task 13 — useComboboxParser

- [x] extract inline parsing logic to `src/hooks/useComboboxParser.ts`
- [x] detect creation vs browse mode
- [x] parse `:t:`, `:td:` prefixes; detect URL
- [x] parse `::tg`, `::col` tag flags
- [x] parse `::t::`, `::link::`, `::td::`, `::itd::` type filters
- [x] parse `##tag` filters; plain text = search

---

## Task 14 — Combobox: keyboard nav + hotkeys

### State

- [x] `selectedIndex` lifted to `Jot/index.tsx`, passed to `MainInput` and `JotItem` (for selected styling)
- [x] `selectedIndex` resets to `-1` on input change

### Navigation (handled in `MainInput` via `getHotkeyHandler`)

- [x] `ArrowUp` / `ArrowDown` — move selection by 1
- [x] `Shift+ArrowUp` / `Shift+ArrowDown` — move selection by 5
- [x] `mod+Shift+ArrowUp` / `mod+Shift+ArrowDown` — jump to top/bottom
- [x] `Escape` — clear selection (set to `-1`)
- [x] `mod+f` — focus main input from anywhere in the app (registered at `Jot` level)

### Item hotkeys (only fire when `selectedIndex > -1`)

- [x] `mod+Enter` — trigger primary action on selected item (link: open, todo: toggle done, text: open ItemDialog stub)
- [x] `mod+shift+c` — copy selected item content to clipboard
- [x] `mod+e` — open ItemDialog (stub until task 18)

## Task 14b — Extended menu

- [ ] extended menu: click-accessible syntax shortcuts

---

## Task 15 — Remaining item mutations

- [x] `useUpdateItemMutation` — saves `previousContent` if content changed (text only)
- [x] `useSoftDeleteItemMutation`, `useRestoreItemMutation`, `useHardDeleteItemMutation`

## Task 15b — Mutation hotkeys (blocked by task 15)

- [x] `mod+shift+backspace` — trash selected item
- [x] `mod+alt+r` — restore selected item, trash only
- [x] `mod+alt+4` — toggle copy-on-click
- [x] `mod+alt+5` — refetch link meta, links only
- [x] `mod+alt+6` — convert to todo, text only

---

## Task 16 — JotItem context menu

- [x] Radix ContextMenu: Copy, Edit, Trash, Restore, Permanently Delete, Refetch, Pin, Unpin, Convert to Todo, Copy on click
- [x] Restore + Permanently Delete only in trash; Trash hidden in trash

---

## Task 17 — Jot page: pinned section, trash notice, onboarding banner

- [x] pinned items rendered above regular list
- [x] onboarding banner: shown if `shouldShowDemoDataBanner`, dismiss + load demo data

---

## Task 18 — ItemDialog

- [x] shell via `modals.open`
- [x] CodeMirror 6 editor (text) + small 4-line editor (todo/link)
- [x] autosave debounced 5s + last saved timestamp
- [x] Cmd/Ctrl+S save and close
- [x] tag editor: single string, collapse spaces on keystroke

---

## Task 19 — ItemDialog: advanced accordion

- [x] `jottedAt` datetime picker
- [x] View Last Version: read-only editor with restore button (text only)

---

## Task 19-2a — Mantine removal: setup + teardown

Remove all Mantine packages: `@mantine/core`, `@mantine/dates`, `@mantine/hooks`, `@mantine/modals`, `@mantine/notifications`, `@mantine/spotlight`, `@mantine/form`.

- [x] Install `@radix-ui/react-accordion`, `sonner`, `react-hotkeys-hook`
- [x] `src/hooks/useDebounced.ts` — custom debounce hook to replace `useDebouncedCallback`
- [x] Remove `MantineProvider`, `ModalsProvider`, `Notifications` from `main.tsx`; remove all `@mantine/*` CSS imports
- [x] Remove `postcss-preset-mantine` from `postcss.config.cjs`

---

## Task 19-2b — Mantine removal: dialog system

- [x] `src/store/dialogStore.ts` — plain Zustand store (no `persist`) with `openDialog({ children })` / `closeAllDialogs()`
- [x] `src/components/DialogManager.tsx` — Radix `Dialog` root consuming the store
- [x] Mount `<DialogManager>` in `main.tsx`
- [x] Replace all `modals.open(...)` call sites with `openDialog(...)`
- [x] Replace all `modals.closeAll()` call sites with `closeAllDialogs()`

---

## Task 19-2c — Mantine removal: ItemDialog surgery

- [x] Replace `Accordion` with `@radix-ui/react-accordion`
- [x] Replace `DateTimePicker` with `<input type="datetime-local">`
- [x] Replace `useDebouncedCallback` with `useDebounced`
- [x] Replace `Button`, `TextInput`, `Textarea` with plain HTML + SCSS

---

## Task 19-2d — Mantine removal: hotkeys + notifications + cleanup

- [x] Replace `getHotkeyHandler` + `useHotkeys` with `react-hotkeys-hook`
- [x] Wire sonner: add `<Toaster>` to `main.tsx`, replace all `notifications.show(...)` calls
- [x] Remove `theme.ts`; remove `useMantineColorScheme` from `App.tsx`
- [x] Uninstall all `@mantine/*` packages

---

## Task 19-3 — Firefox datetime picker fallback

- [ ] Detect Firefox via user agent or feature detection
- [ ] Render fallback UI (separate date + time `<input>` fields, or custom picker) when native `datetime-local` is inadequate
- [ ] Reconcile fallback output back to ISO string for consistent value handling

---

## Task 20 — Collection mutations + CollectionDialog

- [x] `useCreateCollectionMutation`, `useUpdateCollectionMutation`, `useDeleteCollectionMutation`
- [x] CollectionDialog: name, slug (auto), type checkboxes, tag list, Save/Delete

---

## Task 21 — CollectionDropdown

- [x] sorted list: emoji, name, colour, numeric hotkey (1-9)
- [x] core collections always present
- [x] desktop: top bar; mobile: bottom-right
- [x] click + numeric hotkeys navigate to collection
- [x] trash notice: notice items older than 7 days are soft deleted

---

## Task 22 — Collections page

- [x] drag-sort with `@hello-pangea/dnd`
- [x] create, edit, delete via CollectionDialog
- [x] trash always at bottom, not sortable

---

## Task 23 — Header + UserDropdown

- [x] Header with user display name top-right
- [x] UserDropdown: Settings, Manage Collections, Help, Privacy, ToS

---

## Task 24 — Routing

- [x] extract routes to `src/routes.tsx`
- [x] create page stub components in `src/pages/`

---

## Task 25 — Settings page

- [x] user display name, core collection config, sync section (connect/disconnect/status, dummy for now)
- [won't do] Note: emoji for core collections deferred — may drop entirely

---

## Task 25-2 - Dropping emoji for collection

- [ ] Remove display of emoji for collections
- [ ] Remove `icon` from type `Collection`
- [ ] Remove icon fields for core collections

--

## Task 26 — linkFetch service

- [x] `fetchLinkMeta(url)` — validates via `new URL(url)`, calls backend
- [x] offline: toast + return undefined
- [x] wire to item create/refetch

---

## Task 27 — Export + Import

- [x] export `{ items, collections, settings }` pretty-printed JSON
- [x] import: parse, merge into DB, invalidate queries

---

## Task 28 — PWA

- [x] manifest icons

---

## Task 29 — Landing page

- [x] app name + tagline, three feature sections

---

## Task 30 — Demo data

- [x] `buildDemoItems()` in `src/utils/itemFactory.ts` — seed items per spec
- [x] wire to onboarding banner
- [x] seed collections per spec

---

## Task 31b — GIS types + auth service

- [x] Add GIS types to `src/types.ts`
- [x] `src/services/googleAuth.ts`: `postAuthCallback`, `postAuthRefresh`, `postAuthLogout`

---

## Task 31c — useGoogleAuth hook

- [x] `src/hooks/useGoogleAuth.ts`: GIS script loader, `connect` (initCodeClient popup), `disconnect`, `getValidToken`

---

## Task 31d — Drive client

- [x] `src/services/driveClient.ts`: folder discovery/create, file list, download, upsert

---

## Task 31e — Drive sync logic

- [x] `src/services/driveSync.ts`: `runFullDriveSync` — download `data.json`, last-write-wins merge on items + collections, upload

---

## Task 31f — useSync hook

- [x] `src/hooks/useSync.ts`: `useSyncFn` + `useSync` with debounced mutation trigger + visibility change handler

---

## Task 31g — Settings page sync UI

- [x] Wire connect/disconnect, sync status, manual sync button in Settings page

---

## Task 32 — Post-release polish

- [x] Spotlight: setup + actions (theme, nav, export, sync)
- [x] Collection tag picker in ItemDialog: highlights collections whose tags match the item's tags

## Task 33 - Offline handling

- [ ] Implement service worker for offline support
- [ ] Implement offline sync status

---

## Task 34 — Danger Zone + Reset App

### 34a — Storage layer

- [x] Add `clearAllData()` to `src/db/dexie.adapter.ts` — clears `items` and `collections` tables
- [x] Export `forceDeleteDb()` from `src/db/index.ts` — closes Dexie, calls `indexedDB.deleteDatabase("aijot")`

### 34b — Clear data utility

- [x] Create `src/utils/clearData.ts`
- [x] `clearAllData()` — clears IndexedDB tables (items + collections)
- [x] `forceDeleteDb()` — deletes entire IndexedDB by name
- [x] `clearAllCaches()` — clears PWA service worker caches via `caches.keys()` + `caches.delete()`
- [x] `resetZustandStores()` — calls `persist.clearStorage()` on all 5 stores (localUserSettings, localAppData, localSyncData, profileSettings, coreCollectionSettings)

### 34c — Settings UI: Danger Zone section

- [x] Add "Danger Zone" section to Settings page below Sync section
- [x] Section heading with danger styling
- [x] Description: "Removes all items and collections. Your data on Google Drive will remain intact."
- [x] "Clear all data" button (danger variant)

### 34d — Settings UI: Clear data confirmation

- [x] Add `isClearDataDialogOpen` state to Settings
- [x] Confirmation dialog via `useDialogStore.openDialog()`:
    - Title: "Clear all data?"
    - Body: "This cannot be undone."
    - Footer: Cancel (light) + Clear (danger, with loading state)
- [x] On confirm: disconnect Drive → `clearAllData()` → set `shouldShowDemoDataBanner(true)` → reload page

### 34e — Settings UI: Reset App (debug mode)

- [x] Add `isDebugMode` state to Settings (hidden by default)
- [x] Enable debug mode: tap Settings heading 5 times (show indicator)
- [x] "Reset" section visible only when `isDebugMode` is true
- [x] Description: "Wipes local database and all local app data. Cannot be undone."
- [x] "Reset app" button (danger variant)

### 34f — Settings UI: Reset app confirmation

- [x] Add `isResetAppDialogOpen` state to Settings
- [x] Confirmation dialog via `useDialogStore.openDialog()`:
    - Title: "Confirm resetting app?"
    - Body: "This cannot be undone."
    - Footer: Cancel (light) + Reset (danger, with loading state)
- [x] On confirm: `localStorage.clear()` → `sessionStorage.clear()` → `forceDeleteDb()` → `clearAllCaches()` → redirect to `/`

### 34g — Styling

- [x] Add `Settings__BtnDanger` class to `Settings/index.module.scss` using `Btn--Danger`
- [x] Add danger zone section styling

---

## Task 35 — Command Palette Theme Selection

Github issue #1

Refactor theme selection to use cmdk command palette with nested modes. Remove "system" theme option. Set CSS variables via JS instead of CSS selectors. Support predefined themes plus one user custom theme slot.

### 35a — Install cmdk

- [x] `yarn add cmdk`

### 35b — Create themes object

- [x] Create `src/utils/themes.ts`
- [x] Export `themes` object with predefined themes (light, dark)
- [x] Each theme has color values: colBg, colMain, colSub, colBgSub, colText, colDanger
- [x] Export `ThemeName` type (union of theme keys)
- [x] Export `ThemeColors` type derived from themes object

### 35c — Update types

- [x] Modify `src/types.ts`
- [x] Change `ThemeMode` type from `"light" | "dark" | "system"` to `ThemeName`
- [x] Rename `themeMode` to `theme` in store
- [x] Set default to "light"

### 35d — Refactor ThemeManager

- [x] Modify `src/components/ThemeManager.tsx`
- [x] Instead of setting `data-color-scheme` attribute, directly set CSS variables on `<html>` via `document.documentElement.style.setProperty()`
- [x] Remove `resolveColorScheme()` function (no more "system" mode)
- [x] Remove `matchMedia` listener for system theme changes

### 35e — Create CommandPalette component

- [x] Create `src/components/CommandPalette.tsx`
- [x] Use cmdk with Radix Dialog pattern
- [x] Support two modes: `main` and `theme`
- [x] **Main mode sections**: Navigation (Jot, Collections, Settings, Help), Actions (Change Theme...)
- [x] **Theme mode**: List all predefined themes
- [x] Current theme gets checkmark indicator
- [x] Keyboard navigation: ↑↓ move, Enter select, Esc close/revert
- [x] Mouse hover triggers preview (debounced 1s)

### 35f — Create CommandPaletteManager

- [x] Create `src/components/CommandPaletteManager.tsx`
- [x] Mount in `main.tsx` alongside `DialogManager`
- [x] Consume `useCommandPaletteStore` for state management

### 35g — Update spotlight hotkey

- [x] Move `mod+k` hotkey registration to `CommandPaletteManager`
- [x] Remove `mod+p` from `SHORTCUT_SPOTLIGHT`
- [x] Now globally accessible from any route

### 35h — Remove ThemeModeDropdown

- [x] Delete `src/components/ThemeModeDropdown.tsx`
- [x] Delete `src/components/ThemeModeDropdown.module.scss`
- [x] Remove from `src/components/Header.tsx`

### 35i — Update Settings page

- [x] Modify `src/pages/Settings/index.tsx`
- [x] Remove "system" from theme options
- [x] Replace theme radio buttons with button to open CommandPalette in theme mode
- [x] Display current theme name next to button

### 35j — Update styles

- [x] Modify `src/styles/_vars.scss`
- [x] Remove `[data-color-scheme="light"]` and `[data-color-scheme="dark"]` selectors
- [x] Keep `:root` variables for non-theme values (fonts, spacing, lineWidth)
- [x] Add fallback colors in `:root` for SSR/no-JS scenarios

### 35k — Create useThemePreview hook

- [x] Create `src/hooks/useThemePreview.ts`
- [x] Manages preview state (original theme, previewed theme)
- [x] Debounced apply preview (1s)
- [x] Revert function for when dialog closes without commit

---

## Task 36 — Jot Item Expanded Mode

Github issue #2

Add the ability to toggle between compact and expanded view modes in the jot list. Users can set a default mode in Settings, and toggle between modes in the jot view via keyboard shortcut.

### 36a — Add setting to ProfileSettingsStore

- [x] Modify `src/types.ts`: add `shouldShowJotItemExtraInfo: boolean` to `ProfileSettingsStore` interface
- [x] Modify `src/store/profileSettings.ts`: add default value (`false`) and setter `setShouldShowJotItemExtraInfo`

### 36b — Add setting UI in Settings page

- [x] Modify `src/pages/Settings/index.tsx`: add getter + setter for `shouldShowJotItemExtraInfo`
- [x] Add checkbox in Appearance section: "Show extra information in jot list"

### 36c — Add shortcut constant

- [x] Modify `src/utils/constants.ts`: add `SHORTCUT_TOGGLE_JOT_LIST_VIEW = "mod+backslash"`

### 36d — Jot page: local view mode state

- [x] Modify `src/pages/Jot/index.tsx`: add local state `isShowingJotItemExtraInfo`, initialize from profile setting
- [x] Add hotkey handler for Cmd+\ to toggle the local state
- [x] Pass `isExpandedInfoMode` prop to each `JotItem` component

### 36e — JotItem component changes

- [x] Modify `src/components/itemComponent/JotItem.tsx`: add `isExpandedInfoMode: boolean` prop
- [x] Create helper function for detailed datetime format (full format "MMM d, yyyy HH:mm")
- [x] Conditional rendering:
    - **false (compact)**: current single-row layout
    - **true (expanded)**: 3-row layout:
        - Row 1: icon + primary text + status icons
        - Row 2: secondary text (if exists)
        - Row 3: tags (if exists) + detailed datetime

### 36f — Styling

- [x] Modify `src/components/itemComponent/JotItem.module.scss`: add `.JotItem--Expanded` modifier for multi-line expanded layout

### 36g — Rework expanded mode to two rows

- [x] Modify `src/components/itemComponent/JotItem.tsx`:
    - Remove `expandedRow2` variable
    - Update `expandedContent` to use only row1 and row2
- [x] Modify `src/components/itemComponent/JotItem.module.scss`:
    - Remove `.JotItem__ExpandedRow3` styles, update `.JotItem__ExpandedRow2`

**New 2-row layout:**

- Row 1: icon + primary text + status icons
- Row 2: tags + full jottedAt (bottom right)

---

## Task 37 — Import from JustJot

Import collections and items from a JustJot JSON export. JustJot uses folders (items reference a `collection` by ID); ai\*jot uses tags. Each imported collection uses its **slug as a tag**, and items that belonged to it are tagged with the same slug. Trashed items are skipped. Imported collections get `colour: "#000000"` and a random icon. Slug collisions are resolved by appending `-imported` (or `-imported-N`). The flow is kept inline on the Settings page (no separate dialog).

### 37a — JustJot types and parser

- [x] Create `src/services/justjotImport.ts`
- [x] Define `JustJotExportData`, `JustJotCollection`, `JustJotItem` interfaces
- [x] `parseJustJotFile(file)` — read file, `JSON.parse`, validate `itemCollections` and `items` arrays exist

### 37b — Transformer and collision resolver

- [x] `transformJustJotToAijot(data)` — map JustJot shape to ai\*jot shape:
    - Skip items where `isTrashed === true`
    - Collections: preserve `id`, map `name`/`slug`/`sortOrder`, set `tags: [slug]`, `types: ["text", "todo", "link"]`, `icon` from `getRandomIcon()`, `colour: "#000000"`, normalise dates to ISO
    - Items: preserve `id`, map `title` (empty → `undefined`), `content`, `type`, `shouldCopyOnClick`, `isDone` from `isTodoDone`, `faviconUrl` (empty → `undefined`), `tags: [collectionSlug]`, normalise dates, set `jottedAt` from `created`
- [x] `resolveSlugCollisions(slug, existingSlugs)` — append `-imported` (or `-imported-N`) if slug already exists in DB

### 37c — Import summary and commit

- [x] `getJustJotImportSummary(data)` — compare transformed data against existing storage to count new vs updated collections/items
- [x] `commitJustJotImport(data)` — calls `storage.bulkPutCollections` and `storage.bulkPutItems` with the transformed data

### 37d — Settings page: file input, parse handler, inline preview

- [x] Modify `src/pages/Settings/index.tsx`
- [x] Add `justjotImportInputRef` (hidden `<input type="file" accept=".json">`)
- [x] Add "Import from JustJot" button next to existing "Import" button in Data section
- [x] `handleJustJotImportFile` — parse file, resolve slug collisions, transform, compute summary
- [x] Show inline preview below buttons (same pattern as existing import preview): new/updated counts for items and collections
- [x] "Confirm" / "Cancel" buttons for the preview

### 37e — Settings page: confirm flow

- [x] `handleConfirmJustJotImport` — call `commitJustJotImport`, invalidate `queryKeys.items` and `queryKeys.collections`, toast `"JustJot data imported successfully"`
- [x] On error at any step: toast `"Failed to import JustJot data"`
- [x] Reset pending state after confirm or cancel
- [x] Run `yarn format`

---

## Task 38 — Migrate from SCSS Modules to Plain SCSS

GitHub issue #7

Replace CSS Modules (`.module.scss` + `styles` object imports + `composes`) with plain SCSS and `@extend`.

### Changes per file

**SCSS: `X.module.scss` → `X.scss`**

1. `git mv` to strip `.module`
2. Add `@use "styles/global";`
3. Replace `composes: CLS from global;` with `@extend global.CLS;`

**TS/TSX**

1. `import styles from "./X.module.scss"` → `import "./X.scss"`
2. `styles.ClassName` → `"ClassName"` (plain string)
3. Template literals / array joins with `styles.X` → plain strings. Keep template literals only when conditionals require them.

### Commit sequence

- [ ] Phase 1 — `src/components/` (13 scss + 13 tsx = 26 files)
- [ ] Phase 2 — `src/pages/Jot/` (10 scss + 9 tsx = 19 files)
- [ ] Phase 3 — `src/pages/Settings/` (4 scss + 4 tsx = 8 files)
- [ ] Phase 4 — `src/pages/Collections/` (1 scss + 1 tsx = 2 files)
- [ ] Phase 5 — `src/pages/Landing/` (1 scss + 1 tsx = 2 files)
- [ ] Phase 6 — `src/pages/{Help,Privacy,Terms}/` (3 scss + 3 tsx = 6 files)
- [ ] Phase 7 — `src/` (App) (1 scss + 1 tsx = 2 files)
