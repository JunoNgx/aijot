import * as Dialog from "@radix-ui/react-dialog"
import { useHotkeys } from "react-hotkeys-hook"
import { useCommandPaletteStore } from "@/store/commandPaletteStore"
import {
    SHORTCUT_CMD_PAL,
    SHORTCUT_CMD_PAL_ALT,
    SHORTCUT_CMD_PAL_THEME,
} from "@/config/constants"
import CommandPalette from "./CommandPalette"

export default function CommandPaletteManager() {
    const isOpen = useCommandPaletteStore((s) => s.isOpen)
    const mode = useCommandPaletteStore((s) => s.mode)
    const close = useCommandPaletteStore((s) => s.close)
    const setMode = useCommandPaletteStore((s) => s.setMode)
    const open = useCommandPaletteStore((s) => s.open)

    useHotkeys(SHORTCUT_CMD_PAL, () => open("main"), {
        enableOnFormTags: true,
        preventDefault: true,
    })
    useHotkeys(SHORTCUT_CMD_PAL_ALT, () => open("main"), {
        enableOnFormTags: true,
        preventDefault: true,
    })
    useHotkeys(SHORTCUT_CMD_PAL_THEME, () => open("theme"), {
        enableOnFormTags: true,
        preventDefault: true,
    })

    const handleOpenChange = (open: boolean) => {
        if (!open) close()
    }

    const handleModeChange = (newMode: "main" | "theme") => {
        setMode(newMode)
    }

    return (
        <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
            <Dialog.Portal>
                <CommandPalette
                    mode={mode}
                    onModeChange={handleModeChange}
                    onClose={close}
                />
            </Dialog.Portal>
        </Dialog.Root>
    )
}
