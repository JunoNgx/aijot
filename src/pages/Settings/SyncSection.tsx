import { IconRefresh } from "@tabler/icons-react"
import { useGoogleAuth } from "@/hooks/useGoogleAuth"
import { useSyncFn } from "@/hooks/useSync"
import { useLocalSyncData } from "@/store/localSyncData"
import { useLocalUserSettings } from "@/store/localUserSettings"
import { ICON_PROPS_NORMAL } from "@/config/constants"
import { formatFullDatetime } from "@/utils/helpers"
import SettingsSection from "./SettingsSection"
import "./SyncSection.scss"

export default function SyncSection() {
    const is24HourClock = useLocalUserSettings((s) => s.is24HourClock)
    const syncStatus = useLocalSyncData((s) => s.syncStatus)
    const syncError = useLocalSyncData((s) => s.syncError)
    const lastSyncTime = useLocalSyncData((s) => s.lastSyncTime)
    const lastSyncTimeUiText = lastSyncTime
        ? `Last sync: ${formatFullDatetime(lastSyncTime, is24HourClock)}`
        : "Last sync: Never"

    const {
        isConnected,
        isConnecting,
        connectError,
        connect,
        disconnect,
        authToken,
    } = useGoogleAuth()
    const { sync } = useSyncFn()

    const isSyncing = syncStatus === "syncing"
    const syncButtonContent = isSyncing ? (
        <>
            <IconRefresh
                {...ICON_PROPS_NORMAL}
                className="SyncSection__BtnIcon SyncSection__BtnIcon--Spinning"
            />
            Syncing...
        </>
    ) : (
        "Sync now"
    )

    return (
        <SettingsSection
            title="Sync"
            description="Back up your data to Google Drive"
        >
            {isConnected && authToken && (
                <div className="SyncSection__InfoWrapper">
                    <span className="SyncSection__Email">
                        Connected as {authToken.email}
                    </span>
                    <span className="SyncSection__Status">
                        {lastSyncTimeUiText}
                    </span>
                    {syncStatus === "error" && syncError && (
                        <span className="SyncSection__Error">
                            Error: {syncError}
                        </span>
                    )}
                </div>
            )}
            {connectError && (
                <div className="SyncSection__Status SyncSection__Status--Error">
                    {connectError}
                </div>
            )}
            <div className="SyncSection__BtnRow">
                {isConnected ? (
                    <>
                        <button
                            className="SyncSection__BtnAction"
                            type="button"
                            disabled={isSyncing}
                            onClick={() => sync()}
                        >
                            {syncButtonContent}
                        </button>
                        <button
                            className="SyncSection__BtnAction"
                            type="button"
                            onClick={disconnect}
                        >
                            Disconnect
                        </button>
                    </>
                ) : (
                    <button
                        className="SyncSection__BtnConnect"
                        type="button"
                        disabled={isConnecting}
                        onClick={connect}
                    >
                        {isConnecting ? "Connecting..." : "Connect"}
                    </button>
                )}
            </div>
        </SettingsSection>
    )
}
