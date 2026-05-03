import { DateTime } from "luxon"
import { IconX } from "@tabler/icons-react"
import { ICON_PROPS_ACTION } from "@/config/constants"
import { useItemsMutations } from "@/hooks/useItemsMutations"
import { useDialogStore } from "@/store/dialogStore"
import { useLocalUserSettings } from "@/store/localUserSettings"
import { formatDetailedDatetime } from "@/utils/helpers"
import { openItemDialog } from "@/utils/openItemDialog"
import styles from "./PreviousVersionDialog.module.scss"
import type { Item } from "@/types"

interface Props {
    item: Item
}

export default function PreviousVersionDialog({ item }: Props) {
    const { updateItemMutation } = useItemsMutations()
    const isRestoring = updateItemMutation.isPending
    const closeAllDialogs = useDialogStore((s) => s.closeAllDialogs)
    const is24HourClock = useLocalUserSettings((s) => s.is24HourClock)

    const isTextItem = item.type === "text"

    const handleBack = () => {
        closeAllDialogs()
        openItemDialog(item)
    }

    const handleRestore = () => {
        if (!item.previousContent) return
        updateItemMutation.mutate({
            ...item,
            content: item.previousContent,
            previousContent: undefined,
            previousContentRecordedAt: undefined,
            updatedAt: DateTime.now().toISO(),
        })
        closeAllDialogs()
    }

    const timestampDisplay = item.previousContentRecordedAt && (
        <span className={styles.PreviousVersionDialog__Timestamp}>
            Recorded{" "}
            {formatDetailedDatetime(
                item.previousContentRecordedAt,
                is24HourClock,
            )}
        </span>
    )

    return (
        <div className={styles.PreviousVersionDialog}>
            <button
                className={styles.PreviousVersionDialog__CloseBtn}
                onClick={handleBack}
                aria-label="Close"
            >
                <IconX {...ICON_PROPS_ACTION} />
            </button>
            <h2 className={styles.PreviousVersionDialog__Title}>
                Previous Version
            </h2>

            {timestampDisplay}

            <textarea
                className={`Dialog__Input ${styles.PreviousVersionDialog__Textarea}`}
                rows={isTextItem ? 24 : 4}
                value={item.previousContent}
                readOnly
            />

            <div className={styles.PreviousVersionDialog__Footer}>
                <button
                    className={styles.PreviousVersionDialog__BtnBack}
                    onClick={handleBack}
                >
                    Back
                </button>
                <button
                    className={styles.PreviousVersionDialog__BtnRestore}
                    disabled={isRestoring}
                    onClick={handleRestore}
                >
                    {isRestoring ? "Restoring..." : "Restore"}
                </button>
            </div>
        </div>
    )
}
