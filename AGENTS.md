# aijot-frontend — Implementation Notes

## Maintainer's preferences

- Use 4 space indentation
- Variable names for boolean type must always have the appropriate prefix (e.g. is-, should-, does-, has-). There is no exception.
- Do not name variables with a bare adjective. `existing`, `filtered`, `updated`, `prev`, `next` are unacceptable. Use a noun-based name that reflects what the variable holds (e.g. `storedCategory`, `filteredTransactions`, `updatedToken`).
- Prioritise using guard clause and early termination. Avoid `else` and deeply nested codes.
- Use leading operators style for multi-line logical/binary expressions: place the operator at the start of the continuation line, not the end of the preceding one. (Not yet supported by Biome - it will reformat to trailing operators.)
- Use only `yarn` to manage packages
- Use double quotes for strings unless single quotes are required (e.g. a string containing a double quote)
- Use `camelCase` for hooks, `PascalCase` for components, and `camelCase` for all other filenames (no kebab-case)
- Constants use `SCREAMING_SNAKE_CASE` for values
- Exercise "Camel Case Acronyms"; treat acronyms and initialisms as one single word. E.g. `extractFromDb` instead of `extractFromDB`; `convertToUtc` instead of `convertToUTC`
- Use the term `Dialog` instead of `Modal`
- Complicated handler function, taking up more than one line, should be implemented separately outside of the template.
- Do not use the deprecated `FormEvent` and `React.FormEventHandler`
- Do not use em dash
- Avoid nesting by breaking down component templates to variables
- Ask for permission before committing
- Start the commit message with github ticket number, if not on `main`; followed by conventional commit type; start the actual verb with a lowercase character (e.g. `#12 refactor: rename and add boolean prefix to variables`)
- Avoid regex for implementation and usage when possible. Only use when absolutely necessary or the benefit is significant.
- Do not add redundant comments that explain what the code does. Variable names should be self-explanatory. Comments should only be used for non-obvious intent, gotchas, or design decisions.
- Implement reusable utility CSS classes in `global.scss` as needed rather than repeating inline styles
- CSS custom properties (variables) use `camelCase` (e.g. `--colBg`)
- Use CSS variables when possible, especially for common patterns (e.g. `var(--lineThickness)` instead of `1px`). Variables are defined in `src/styles/_vars.scss`
- Run `yarn format` after every set of changes before handing back
- Use plain HTML + SCSS for all UI. Use Radix UI primitives where accessibility behaviour is non-trivial (e.g. dialogs, accordions, context menus, dropdowns)
- Use quartered rem values (e.g. 0.25rem; 0.5rem; 0.75rem) unless absolutely necessary
- Create new css variables only with explicit instructions to do so
- Do not set color or `font-size` without using a css variable
- NEVER amend, rebase, or otherwise rewrite git history unless explicitly instructed to do so
- NEVER run `git push` under any circumstance

## Patterns from JustJot

Reference codebase: `../justjot-frontend`. Key patterns to carry forward:

### Packages

- Radix UI for accessible primitives: context menus (`@radix-ui/react-context-menu`), dropdowns (`@radix-ui/react-dropdown-menu`), dialogs (`@radix-ui/react-dialog`), accordions (`@radix-ui/react-accordion`)
- `@hello-pangea/dnd` for drag-and-drop (collection sort)
- `luxon` for date formatting
- `@tabler/icons-react` for icons

### Hook architecture

Two-layer split for all data operations:

- `useXxxApiCalls`: raw DB/API calls only. No UI state, no notifications. Accepts `successfulCallback?`, `errorCallback?`, `setLoadingState?`.
- `useXxxActions`: calls API layer, handles optimistic updates, error recovery, notifications, dialog opening.

### Navigation

- `useNavigateRoutes` hook: all `navigate()` calls centralised here. No inline `navigate()` in components.
- Route guard as a render-less `<NavigationHandler>` component (uses `useLocation` + `useEffect`). Avoids React Router loader/guard patterns.

### Collection sort order

- Floating-point midpoint insert: `(prev.sortOrder + next.sortOrder) / 2`
- Prepend: `first.sortOrder - 1000`
- Append: `last.sortOrder + 1000`
- Increment constant: 1000

### Dialogs

- Ad-hoc dialogs: `useDialogStore.getState().openDialog({ children: <JSX> })`, close with `closeAllDialogs()`
- `<DialogManager>` in `main.tsx` renders the active dialog via Radix `Dialog.Root`
- Destructive confirmations: use `modals.openConfirmModal(...)` pattern — not yet implemented, use a dedicated dialog component when needed

### Hotkeys

- Global hotkeys: `useHotkeys` with `{ enableOnFormTags: true }`
- Inline `onKeyDown` hotkeys: `getHotkeyHandler(tuples)` from `src/utils/hotkeyHandler.ts`
- Shortcut format: `"mod+key"`, `"shift+key"`, `"mod+shift+key"` — `mod` = Ctrl on Windows/Linux, Cmd on Mac
