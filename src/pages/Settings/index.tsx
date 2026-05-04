import { useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useGoogleAuth } from "@/hooks/useGoogleAuth"
import { useSyncFn } from "@/hooks/useSync"
import { useNavigateRoutes } from "@/hooks/useNavigateRoutes"
import { useLocalAppData } from "@/store/localAppData"
import { useLocalUserSettings } from "@/store/localUserSettings"
import { useCommandPaletteStore } from "@/store/commandPaletteStore"
import { useSyncedUserSettings } from "@/store/syncedUserSettings"
import { useLocalSyncData } from "@/store/localSyncData"
import { useDialogStore } from "@/store/dialogStore"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import { SANS_SERIF_FONTS, MONO_FONTS } from "@/config/fonts"
import {
    exportData,
    parseImportFile,
    getImportSummary,
    commitImport,
} from "@/services/exportImport"
import {
    parseJustJotFile,
    getJustJotImportSummary,
    commitJustJotImport,
} from "@/services/justjotImport"
import { clearAllData, resetApp } from "@/utils/clearData"
import { APP_VERSION, COMMIT_SHA } from "@/config/constants"
import { formatFullDatetime } from "@/utils/helpers"
import { useThemeActions } from "@/hooks/useThemeActions"
import type { ExportData, ImportSummary } from "@/types"
import type { JustJotExportData } from "@/services/justjotImport"
import { queryKeys } from "@/db/queryKeys"
import styles from "./index.module.scss"
import BackBtn from "@/components/BackBtn"

export default function Settings() {
    useDocumentTitle("Settings")
    const queryClient = useQueryClient()
    const importInputRef = useRef<HTMLInputElement>(null)
    const justjotImportInputRef = useRef<HTMLInputElement>(null)
    const [pendingImport, setPendingImport] = useState<ExportData | null>(null)
    const [importSummary, setImportSummary] = useState<ImportSummary | null>(
        null,
    )
    const [pendingJustJotImport, setPendingJustJotImport] =
        useState<JustJotExportData | null>(null)
    const [justJotImportSummary, setJustJotImportSummary] =
        useState<ImportSummary | null>(null)
    const [isClearingData, setIsClearingData] = useState(false)
    const [isResettingApp, setIsResettingApp] = useState(false)
    const [isDebugMode, setIsDebugMode] = useState(false)

    const theme = useLocalUserSettings((s) => s.theme)
    const fontFamily = useLocalUserSettings((s) => s.fontFamily)
    const setFontFamily = useLocalUserSettings((s) => s.setFontFamily)
    const fontFamilyMono = useLocalUserSettings((s) => s.fontFamilyMono)
    const setFontFamilyMono = useLocalUserSettings((s) => s.setFontFamilyMono)
    const is24HourClock = useLocalUserSettings((s) => s.is24HourClock)
    const setIs24HourClock = useLocalUserSettings((s) => s.setIs24HourClock)

    const defaultCollectionSlug = useSyncedUserSettings(
        (s) => s.defaultCollectionSlug,
    )

    const userDisplayName = useSyncedUserSettings((s) => s.userDisplayName)
    const setUserDisplayName = useSyncedUserSettings(
        (s) => s.setUserDisplayName,
    )
    const shouldApplyTagsOfCurrCollection = useSyncedUserSettings(
        (s) => s.shouldApplyTagsOfCurrCollection,
    )
    const setShouldApplyTagsOfCurrCollection = useSyncedUserSettings(
        (s) => s.setShouldApplyTagsOfCurrCollection,
    )
    const shouldCustomSortCollections = useSyncedUserSettings(
        (s) => s.shouldCustomSortCollections,
    )
    const setShouldCustomSortCollections = useSyncedUserSettings(
        (s) => s.setShouldCustomSortCollections,
    )
    const shouldShowJotItemExtraInfo = useSyncedUserSettings(
        (s) => s.shouldShowJotItemExtraInfo,
    )
    const setShouldShowJotItemExtraInfo = useSyncedUserSettings(
        (s) => s.setShouldShowJotItemExtraInfo,
    )
    const importAllSettings = useSyncedUserSettings((s) => s.importAllSettings)

    const allCollection = useSyncedUserSettings((s) => s.allCollection)
    const untaggedCollection = useSyncedUserSettings(
        (s) => s.untaggedCollection,
    )
    const trashCollection = useSyncedUserSettings((s) => s.trashCollection)

    const syncStatus = useLocalSyncData((s) => s.syncStatus)
    const syncError = useLocalSyncData((s) => s.syncError)
    const lastSyncTime = useLocalSyncData((s) => s.lastSyncTime)
    const lastSyncTimeUiText = lastSyncTime
        ? `Last sync: ${formatFullDatetime(lastSyncTime, is24HourClock)}`
        : "Last sync: Never"
    const setShouldShowDemoDataBanner = useLocalAppData(
        (s) => s.setShouldShowDemoDataBanner,
    )

    const {
        isConnected,
        isConnecting,
        connectError,
        connect,
        disconnect,
        authToken,
    } = useGoogleAuth()
    const { sync } = useSyncFn()
    const { randomiseTheme } = useThemeActions()
    const { navigateToHelp, navigateToPrivacy, navigateToTerms } =
        useNavigateRoutes()

    const closeAllDialogs = useDialogStore((s) => s.closeAllDialogs)

    const handleExport = async () => {
        await exportData({
            syncedUserSettings: {
                userDisplayName,
                shouldApplyTagsOfCurrCollection,
                defaultCollectionSlug,
                shouldCustomSortCollections,
                shouldShowJotItemExtraInfo,
            },
            coreCollections: {
                all: allCollection,
                untagged: untaggedCollection,
                trash: trashCollection,
            },
        })
    }

    const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        try {
            const data = await parseImportFile(file)
            const summary = await getImportSummary(data)
            setPendingImport(data)
            setImportSummary(summary)
        } catch {
            toast.error("Failed to read file: invalid format")
        } finally {
            e.target.value = ""
        }
    }

    const handleConfirmImport = async () => {
        if (!pendingImport) return
        try {
            const settings = await commitImport(pendingImport)
            importAllSettings(settings)
            toast("Data imported successfully")
        } catch {
            toast.error("Failed to import data")
        } finally {
            setPendingImport(null)
            setImportSummary(null)
        }
    }

    const handleJustJotImportFile = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0]
        if (!file) return
        try {
            const data = await parseJustJotFile(file)
            const summary = await getJustJotImportSummary(data)
            setPendingJustJotImport(data)
            setJustJotImportSummary(summary)
            setPendingImport(null)
            setImportSummary(null)
        } catch {
            toast.error("Failed to read file: invalid JustJot format")
        } finally {
            e.target.value = ""
        }
    }

    const handleConfirmJustJotImport = async () => {
        if (!pendingJustJotImport) return
        try {
            await commitJustJotImport(pendingJustJotImport)
            queryClient.invalidateQueries({ queryKey: queryKeys.items })
            queryClient.invalidateQueries({ queryKey: queryKeys.collections })
            toast("JustJot data imported successfully")
        } catch {
            toast.error("Failed to import JustJot data")
        } finally {
            setPendingJustJotImport(null)
            setJustJotImportSummary(null)
        }
    }

    const handleClearData = async () => {
        setIsClearingData(true)
        try {
            disconnect()
            await clearAllData()
            setShouldShowDemoDataBanner(true)
            toast.loading("All data cleared. Reloading...")
            setTimeout(() => window.location.reload(), 1500)
        } catch (err) {
            toast.error((err as Error).message)
            setIsClearingData(false)
        }
    }

    const handleResetApp = async () => {
        setIsResettingApp(true)
        try {
            await resetApp()
        } catch (err) {
            toast.error((err as Error).message)
            setIsResettingApp(false)
        }
    }

    const openClearDataDialog = () => {
        useDialogStore.getState().openDialog({
            children: (
                <>
                    <p className={styles.Settings__DialogWarning}>
                        This cannot be undone.
                    </p>
                    <div className={styles.Settings__DialogFooter}>
                        <button
                            className={styles.Settings__BtnAction}
                            type="button"
                            onClick={closeAllDialogs}
                        >
                            Cancel
                        </button>
                        <button
                            className={styles.Settings__BtnDanger}
                            type="button"
                            disabled={isClearingData}
                            onClick={handleClearData}
                        >
                            {isClearingData ? "Clearing..." : "Clear"}
                        </button>
                    </div>
                </>
            ),
        })
    }

    const openResetAppDialog = () => {
        useDialogStore.getState().openDialog({
            children: (
                <>
                    <p className={styles.Settings__DialogWarning}>
                        This cannot be undone.
                    </p>
                    <div className={styles.Settings__DialogFooter}>
                        <button
                            className={styles.Settings__BtnAction}
                            type="button"
                            onClick={closeAllDialogs}
                        >
                            Cancel
                        </button>
                        <button
                            className={styles.Settings__BtnDanger}
                            type="button"
                            disabled={isResettingApp}
                            onClick={handleResetApp}
                        >
                            {isResettingApp ? "Resetting..." : "Reset app"}
                        </button>
                    </div>
                </>
            ),
        })
    }

    const handleDebugEnableClick = () => {
        if (!isDebugMode) {
            setIsDebugMode(true)
            toast("Debug mode enabled")
        }
    }

    const itemDisplayDescId = "SettingDescDisplayMode"
    const hourModeDescId = "SettingDescHourMode"
    const autoApplyTagsDescId = "SettingDesAutoApplyTag"

    return (
        <div className={styles.Settings}>
            <BackBtn />
            <h2 className={styles.Settings__Title}>Settings</h2>

            <section className={styles.Section}>
                <h3 className={styles.Section__Title}>Sync</h3>
                <p className={styles.Section__Description}>
                    Back up your data to Google Drive
                </p>
                {isConnected && authToken && (
                    <div className={styles.Field__SyncInfoWrapper}>
                        <span className={styles.Field__SyncEmail}>
                            Connected as {authToken.email}
                        </span>
                        <span className={styles.Field__SyncStatus}>
                            {syncStatus === "syncing"
                                ? "Syncing..."
                                : lastSyncTimeUiText}
                        </span>
                        {syncStatus === "error" && syncError && (
                            <span className={styles.Field__SyncError}>
                                Error: {syncError}
                            </span>
                        )}
                    </div>
                )}
                {connectError && (
                    <div
                        className={`${styles.Field__SyncStatus} ${styles["Field__SyncStatus--Error"]}`}
                    >
                        {connectError}
                    </div>
                )}
                <div className="FlexRow">
                    {isConnected ? (
                        <>
                            <button
                                className={styles.Settings__BtnAction}
                                type="button"
                                disabled={syncStatus === "syncing"}
                                onClick={() => sync()}
                            >
                                Sync now
                            </button>
                            <button
                                className={styles.Settings__BtnAction}
                                type="button"
                                onClick={disconnect}
                            >
                                Disconnect
                            </button>
                        </>
                    ) : (
                        <button
                            className={styles.Settings__BtnConnect}
                            type="button"
                            disabled={isConnecting}
                            onClick={connect}
                        >
                            {isConnecting ? "Connecting..." : "Connect"}
                        </button>
                    )}
                </div>
            </section>

            <section className={styles.Section}>
                <h3 className={styles.Section__Title}>Preferences</h3>

                <div className={`${styles.Field} ${styles["Field--FlexRow"]}`}>
                    <label
                        className={styles.Field__Label}
                        htmlFor="displayName"
                    >
                        Display name
                    </label>
                    <input
                        id="displayName"
                        type="text"
                        className={styles.Field__Input}
                        value={userDisplayName}
                        onChange={(e) => setUserDisplayName(e.target.value)}
                    />
                </div>

                <div className={`${styles.Field} ${styles["Field--FlexRow"]}`}>
                    <label className={styles.Field__Label}>
                        Collection sort order:
                    </label>
                    <div className={styles.Field__RadioGroup}>
                        <label className={styles.Field__Radio}>
                            <input
                                type="radio"
                                name="collectionSortOrder"
                                checked={shouldCustomSortCollections}
                                onChange={() =>
                                    setShouldCustomSortCollections(true)
                                }
                            />
                            Custom
                        </label>
                        <label className={styles.Field__Radio}>
                            <input
                                type="radio"
                                name="collectionSortOrder"
                                checked={!shouldCustomSortCollections}
                                onChange={() =>
                                    setShouldCustomSortCollections(false)
                                }
                            />
                            Alphabetically
                        </label>
                    </div>
                </div>

                <div className={styles.Field}>
                    <label className={styles.Field__Checkbox}>
                        <input
                            aria-describedby={autoApplyTagsDescId}
                            type="checkbox"
                            checked={shouldApplyTagsOfCurrCollection}
                            onChange={(e) =>
                                setShouldApplyTagsOfCurrCollection(
                                    e.target.checked,
                                )
                            }
                        />
                        Auto-apply collection tags when creating items
                    </label>
                    <small
                        id={autoApplyTagsDescId}
                        className={styles.Field__Description}
                    >
                        The tags of the current collection will also be applied,
                        in addition to syntax specification.
                    </small>
                </div>

                <div className={styles.Field}>
                    <label className={styles.Field__Checkbox}>
                        <input
                            aria-describedby={itemDisplayDescId}
                            type="checkbox"
                            checked={shouldShowJotItemExtraInfo}
                            onChange={(e) => {
                                setShouldShowJotItemExtraInfo(e.target.checked)
                            }}
                        />
                        Display jot items with extra info by default
                    </label>
                    <small
                        id={itemDisplayDescId}
                        className={styles.Field__Description}
                    >
                        Default initial state for item display mode. Can be
                        toggled mid-session.
                    </small>
                </div>
            </section>

            <section className={styles.Section}>
                <h3 className={styles.Section__Title}>Local device config</h3>
                <p className={styles.Section__Description}>
                    The following settings are not synchronised to your cloud
                    data
                </p>

                <div className={styles.Field}>
                    <label className={styles.Field__Checkbox}>
                        <input
                            aria-describedby={hourModeDescId}
                            type="checkbox"
                            checked={is24HourClock}
                            onChange={(e) => {
                                setIs24HourClock(e.target.checked)
                            }}
                        />
                        Use 24-hour clock
                    </label>
                    <small
                        id={hourModeDescId}
                        className={styles.Field__Description}
                    >
                        16:35 vs 04:35 pm
                    </small>
                </div>

                <div className={`${styles.Field} ${styles["Field--FlexRow"]}`}>
                    <label className={styles.Field__Label}>
                        Current theme:
                    </label>
                    <span className={styles.Settings__CurrentTheme}>
                        {theme}
                    </span>
                    <div className={styles.Settings__ThemeBtnWrapper}>
                        <button
                            type="button"
                            className={styles.Settings__BtnAction}
                            onClick={() => {
                                useCommandPaletteStore.getState().open("theme")
                            }}
                        >
                            Change Theme
                        </button>
                        <button
                            type="button"
                            className={styles.Settings__BtnAction}
                            onClick={randomiseTheme}
                        >
                            Randomise
                        </button>
                    </div>
                </div>

                <div className={`${styles.Field} ${styles["Field--FlexRow"]}`}>
                    <label
                        className={styles.Field__Label}
                        htmlFor="uiFontSelect"
                    >
                        Primary UI font:
                    </label>
                    <select
                        id="uiFontSelect"
                        className={styles.Field__Input}
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value)}
                    >
                        {SANS_SERIF_FONTS.map((font) => (
                            <option key={font.cssName} value={font.cssName}>
                                {font.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={`${styles.Field} ${styles["Field--FlexRow"]}`}>
                    <label
                        className={styles.Field__Label}
                        htmlFor="codeFontSelect"
                    >
                        Input mono font:
                    </label>
                    <select
                        id="codeFontSelect"
                        className={styles.Field__Input}
                        value={fontFamilyMono}
                        onChange={(e) => setFontFamilyMono(e.target.value)}
                    >
                        {MONO_FONTS.map((font) => (
                            <option key={font.cssName} value={font.cssName}>
                                {font.name}
                            </option>
                        ))}
                    </select>
                </div>
            </section>

            <section className={styles.Section}>
                <h3 className={styles.Section__Title}>Data</h3>
                <p className={styles.Section__Description}>
                    Export or import your items, collections, and settings
                </p>
                <div className="FlexRow">
                    <button
                        className={styles.Settings__BtnAction}
                        type="button"
                        onClick={handleExport}
                    >
                        Export
                    </button>
                    <button
                        className={styles.Settings__BtnAction}
                        type="button"
                        onClick={() => importInputRef.current?.click()}
                    >
                        Import
                    </button>
                    <input
                        ref={importInputRef}
                        type="file"
                        accept=".json"
                        style={{ display: "none" }}
                        onChange={handleImportFile}
                    />
                </div>
                <div className="FlexRow">
                    <button
                        className={styles.Settings__BtnAction}
                        type="button"
                        onClick={() => justjotImportInputRef.current?.click()}
                    >
                        Import from JustJot
                    </button>
                    <input
                        ref={justjotImportInputRef}
                        type="file"
                        accept=".json"
                        style={{ display: "none" }}
                        onChange={handleJustJotImportFile}
                    />
                </div>
                {pendingImport && importSummary && (
                    <div className={styles.Settings__ImportPreview}>
                        <span>
                            {importSummary.newItems} new,{" "}
                            {importSummary.updatedItems} updated items
                        </span>
                        <span>
                            {importSummary.newCollections} new,{" "}
                            {importSummary.updatedCollections} updated
                            collections
                        </span>
                        <div className={styles.Settings__ImportPreviewActions}>
                            <button
                                className={styles.Settings__BtnAction}
                                type="button"
                                onClick={handleConfirmImport}
                            >
                                Confirm
                            </button>
                            <button
                                className={styles.Settings__BtnAction}
                                type="button"
                                onClick={() => {
                                    setPendingImport(null)
                                    setImportSummary(null)
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
                {pendingJustJotImport && justJotImportSummary && (
                    <div className={styles.Settings__ImportPreview}>
                        <span>
                            {justJotImportSummary.newItems} new,{" "}
                            {justJotImportSummary.updatedItems} updated items
                        </span>
                        <span>
                            {justJotImportSummary.newCollections} new,{" "}
                            {justJotImportSummary.updatedCollections} updated
                            collections
                        </span>
                        <div className={styles.Settings__ImportPreviewActions}>
                            <button
                                className={styles.Settings__BtnAction}
                                type="button"
                                onClick={handleConfirmJustJotImport}
                            >
                                Confirm
                            </button>
                            <button
                                className={styles.Settings__BtnAction}
                                type="button"
                                onClick={() => {
                                    setPendingJustJotImport(null)
                                    setJustJotImportSummary(null)
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </section>

            <section className={styles.Section}>
                <h3 className={styles.Section__Title}>Help</h3>
                <button
                    className={styles.Settings__BtnAction}
                    type="button"
                    onClick={navigateToHelp}
                >
                    Help guide
                </button>
            </section>

            <section className={styles.Section}>
                <h3
                    className={styles.Section__Title}
                    onClick={handleDebugEnableClick}
                    tabIndex={0}
                    role="button"
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            handleDebugEnableClick()
                        }
                    }}
                >
                    About
                </h3>
                <p className={styles.Settings__Version}>
                    Version {APP_VERSION} ({COMMIT_SHA})
                </p>
                <div className="FlexRow">
                    <button
                        className={styles.Settings__BtnAction}
                        type="button"
                        onClick={navigateToPrivacy}
                    >
                        Privacy policy
                    </button>
                    <button
                        className={styles.Settings__BtnAction}
                        type="button"
                        onClick={navigateToTerms}
                    >
                        Terms of Services
                    </button>
                </div>
            </section>

            <section
                className={`${styles.Section} ${styles["Section--Spaced"]}`}
            >
                <h3
                    className={`${styles.Section__Title} ${styles["Section__Title--Danger"]}`}
                >
                    Danger Zone
                </h3>
                <p className={styles.Section__Description}>
                    Removes all items and collections. Your data on Google Drive
                    will remain intact.
                </p>
                <button
                    className={styles.Settings__BtnDanger}
                    type="button"
                    onClick={openClearDataDialog}
                >
                    Clear all data
                </button>
            </section>

            {isDebugMode && (
                <section className={styles.Section}>
                    <h3 className={styles.Section__Title}>Debug</h3>
                    <button
                        className={styles.Settings__Btn}
                        type="button"
                        onClick={() =>
                            toast(
                                "Debug toast message with slightly long content",
                                {
                                    action: {
                                        label: "Btn",
                                        onClick: () => {},
                                    },
                                    duration: Infinity,
                                },
                            )
                        }
                    >
                        Trigger test toast
                    </button>
                    <p className={styles.Section__Description}>
                        Wipes local database and all local app data. Cannot be
                        undone.
                    </p>
                    <button
                        className={styles.Settings__BtnDanger}
                        type="button"
                        onClick={openResetAppDialog}
                    >
                        Reset app
                    </button>
                </section>
            )}
        </div>
    )
}
