// Key format: "mod+shift+key", "shift+key", "key"
// mod = Ctrl on Windows/Linux, Cmd on Mac

type HotkeyTuple = [string, () => void]

function isShortcutMatch(e: React.KeyboardEvent, shortcut: string): boolean {
    const parts = shortcut.split("+")
    const key = parts[parts.length - 1]
    const mods = parts.slice(0, -1).map((p) => p.toLowerCase())

    const isModNeeded = mods.includes("mod")
    const isShiftNeeded = mods.includes("shift")
    const isAltNeeded = mods.includes("alt")

    const hasMod = e.metaKey || e.ctrlKey
    if (isModNeeded !== hasMod) return false
    if (isShiftNeeded !== e.shiftKey) return false
    if (isAltNeeded !== e.altKey) return false

    return e.key === key || e.key.toLowerCase() === key.toLowerCase()
}

export function getHotkeyHandler(hotkeys: HotkeyTuple[]) {
    return (e: React.KeyboardEvent) => {
        for (const [shortcut, handler] of hotkeys) {
            if (!isShortcutMatch(e, shortcut)) continue

            e.preventDefault()
            handler()
            return
        }
    }
}
