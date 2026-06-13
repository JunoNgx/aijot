import { useCallback } from "react"
import { useHotkeys } from "react-hotkeys-hook"
import { IconRefresh } from "@tabler/icons-react"
import { SHORTCUT_SYNC, ICON_PROPS_NORMAL } from "@/config/constants"
import { useSyncFn } from "@/hooks/useSync"
import { useLocalSyncData } from "@/store/localSyncData"
import { useLocalUserSettings } from "@/store/localUserSettings"
import { formatDatetime } from "@/utils/helpers"
import "./SyncButton.scss"

export default function SyncButton() {
    const { sync } = useSyncFn()
    const syncStatus = useLocalSyncData((s) => s.syncStatus)
    const lastSyncTime = useLocalSyncData((s) => s.lastSyncTime)
    const authToken = useLocalSyncData((s) => s.authToken)
    const is24HourClock = useLocalUserSettings((s) => s.is24HourClock)

    const handleSync = useCallback(
        (e: KeyboardEvent) => {
            if ((e.target as HTMLElement).closest('[role="dialog"]')) return
            sync()
        },
        [sync],
    )

    useHotkeys(SHORTCUT_SYNC, handleSync, {
        enableOnFormTags: true,
        preventDefault: true,
    })

    const isSyncing = syncStatus === "syncing"

    if (authToken === undefined) return null

    const syncLabel = (() => {
        if (isSyncing) return "Syncing"
        if (syncStatus === "error") return "Sync failed"
        if (lastSyncTime)
            return `Last sync: ${formatDatetime(lastSyncTime, is24HourClock)}`
        return "Never synced"
    })()

    return (
        <button
            className="SyncButton"
            type="button"
            onClick={() => {
                sync()
            }}
            disabled={isSyncing}
        >
            <IconRefresh
                {...ICON_PROPS_NORMAL}
                className={
                    isSyncing
                        ? "SyncButton__Icon SyncButton__Icon--Spinning"
                        : "SyncButton__Icon"
                }
            />
            <span className="SyncButton__Label">{syncLabel}</span>
        </button>
    )
}
