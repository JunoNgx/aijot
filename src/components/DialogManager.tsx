import * as Dialog from "@radix-ui/react-dialog"
import { toast } from "sonner"
import { useDialogStore } from "@/store/dialogStore"
import styles from "./DialogManager.module.scss"
import { useHotkeys } from "react-hotkeys-hook"
import { openShortcutDialog } from "@/utils/openShortcutDialog"
import {
    SHORTCUT_SHORTCUTS_HELP,
    SHORTCUT_DISMISS_ALL_NOTIFICATIONS,
} from "@/config/constants"

export default function DialogManager() {
    const isOpen = useDialogStore((s) => s.isOpen)
    const children = useDialogStore((s) => s.children)
    const closeAllDialogs = useDialogStore((s) => s.closeAllDialogs)

    const handleOpenChange = (isShowingDialog: boolean) => {
        if (!isShowingDialog) closeAllDialogs()
    }

    const toggleShortcutHelp = (isShowingDialog: boolean) => {
        if (isShowingDialog) {
            closeAllDialogs()
            return
        }

        openShortcutDialog()
    }

    useHotkeys(
        SHORTCUT_SHORTCUTS_HELP,
        () => {
            toggleShortcutHelp(isOpen)
        },
        {
            enableOnFormTags: true,
            preventDefault: true,
        },
    )

    useHotkeys(
        SHORTCUT_DISMISS_ALL_NOTIFICATIONS,
        () => {
            toast.dismiss()
        },
        {
            enableOnFormTags: true,
            preventDefault: true,
        },
    )

    return (
        <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className={styles.DialogManager__Overlay} />
                <Dialog.Content
                    aria-describedby={undefined}
                    className={styles.DialogManager__Content}
                >
                    <Dialog.Title className={styles.DialogManager__Title}>
                        Dialog
                    </Dialog.Title>
                    {children}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}
