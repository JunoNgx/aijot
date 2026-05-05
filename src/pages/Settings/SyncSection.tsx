import { useGoogleAuth } from "@/hooks/useGoogleAuth"
import { useSyncFn } from "@/hooks/useSync"
import { useLocalSyncData } from "@/store/localSyncData"
import { useLocalUserSettings } from "@/store/localUserSettings"
import { formatFullDatetime } from "@/utils/helpers"
import SettingsSection from "./SettingsSection"
import styles from "./SyncSection.module.scss"

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

    return (
        <SettingsSection
            title="Sync"
            description="Back up your data to Google Drive"
        >
            {isConnected && authToken && (
                <div className={styles.SyncSection__InfoWrapper}>
                    <span className={styles.SyncSection__Email}>
                        Connected as {authToken.email}
                    </span>
                    <span className={styles.SyncSection__Status}>
                        {syncStatus === "syncing"
                            ? "Syncing..."
                            : lastSyncTimeUiText}
                    </span>
                    {syncStatus === "error" && syncError && (
                        <span className={styles.SyncSection__Error}>
                            Error: {syncError}
                        </span>
                    )}
                </div>
            )}
            {connectError && (
                <div className={styles["SyncSection__Status--Error"]}>
                    {connectError}
                </div>
            )}
            <div className="FlexRow">
                {isConnected ? (
                    <>
                        <button
                            className={styles.SyncSection__BtnAction}
                            type="button"
                            disabled={syncStatus === "syncing"}
                            onClick={() => sync()}
                        >
                            Sync now
                        </button>
                        <button
                            className={styles.SyncSection__BtnAction}
                            type="button"
                            onClick={disconnect}
                        >
                            Disconnect
                        </button>
                    </>
                ) : (
                    <button
                        className={styles.SyncSection__BtnConnect}
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
