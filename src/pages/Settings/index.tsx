import { useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useSyncProvider } from "@/hooks/useSyncProvider"
import { useNavigateRoutes } from "@/hooks/useNavigateRoutes"
import { useLocalAppData } from "@/store/localAppData"
import { useLocalUserSettings } from "@/store/localUserSettings"
import { useCommandPaletteStore } from "@/store/commandPaletteStore"
import { useSyncedUserSettings } from "@/store/syncedUserSettings"

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
import { useThemeActions } from "@/hooks/useThemeActions"
import type { ExportData, ImportSummary } from "@/types"
import type { JustJotExportData } from "@/services/justjotImport"
import { queryKeys } from "@/db/queryKeys"
import "./index.scss"
import BackBtn from "@/components/BackBtn"
import SettingsSection from "./SettingsSection"
import SyncSection from "./SyncSection"
import ImportPreview from "./ImportPreview"

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

    const setShouldShowDemoDataBanner = useLocalAppData(
        (s) => s.setShouldShowDemoDataBanner,
    )

    const { disconnect } = useSyncProvider()
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

    const handleCancelImport = () => {
        setPendingImport(null)
        setImportSummary(null)
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

    const handleCancelJustJotImport = () => {
        setPendingJustJotImport(null)
        setJustJotImportSummary(null)
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
                    <p className="Settings__DialogWarning">
                        This cannot be undone.
                    </p>
                    <div className="Settings__DialogFooter">
                        <button
                            className="Settings__BtnAction"
                            type="button"
                            onClick={closeAllDialogs}
                        >
                            Cancel
                        </button>
                        <button
                            className="Settings__BtnDanger"
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
                    <p className="Settings__DialogWarning">
                        This cannot be undone.
                    </p>
                    <div className="Settings__DialogFooter">
                        <button
                            className="Settings__BtnAction"
                            type="button"
                            onClick={closeAllDialogs}
                        >
                            Cancel
                        </button>
                        <button
                            className="Settings__BtnDanger"
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

    const handleAboutKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            handleDebugEnableClick()
        }
    }

    const handleTriggerTestToast = () => {
        toast("Debug toast message with slightly long content", {
            action: {
                label: "Btn",
                onClick: () => {},
            },
            duration: Infinity,
        })
    }

    const itemDisplayDescId = "SettingDescDisplayMode"
    const hourModeDescId = "SettingDescHourMode"
    const autoApplyTagsDescId = "SettingDesAutoApplyTag"

    return (
        <div className="Settings">
            <BackBtn />
            <h2 className="Settings__Title">Settings</h2>

            <SyncSection />

            <SettingsSection title="Preferences">
                <div className="Field Field--FlexRow">
                    <label className="Field__Label" htmlFor="displayName">
                        Display name
                    </label>
                    <input
                        id="displayName"
                        type="text"
                        className="Field__Input"
                        value={userDisplayName}
                        onChange={(e) => setUserDisplayName(e.target.value)}
                    />
                </div>

                <div className="Field Field--FlexRow">
                    <label className="Field__Label">
                        Collection sort order:
                    </label>
                    <div className="Field__RadioGroup">
                        <label className="Field__Radio">
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
                        <label className="Field__Radio">
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

                <div className="Field">
                    <label className="Field__Checkbox">
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
                        className="Field__Description"
                    >
                        The tags of the current collection will also be applied,
                        in addition to syntax specification.
                    </small>
                </div>

                <div className="Field">
                    <label className="Field__Checkbox">
                        <input
                            aria-describedby={itemDisplayDescId}
                            type="checkbox"
                            checked={shouldShowJotItemExtraInfo}
                            onChange={(e) =>
                                setShouldShowJotItemExtraInfo(e.target.checked)
                            }
                        />
                        Display jot items with extra info by default
                    </label>
                    <small
                        id={itemDisplayDescId}
                        className="Field__Description"
                    >
                        Default initial state for item display mode. Can be
                        toggled mid-session.
                    </small>
                </div>
            </SettingsSection>

            <SettingsSection
                title="Local device config"
                description="The following settings are not synchronised to your cloud data"
            >
                <div className="Field">
                    <label className="Field__Checkbox">
                        <input
                            aria-describedby={hourModeDescId}
                            type="checkbox"
                            checked={is24HourClock}
                            onChange={(e) => setIs24HourClock(e.target.checked)}
                        />
                        Use 24-hour clock
                    </label>
                    <small id={hourModeDescId} className="Field__Description">
                        16:35 vs 04:35 pm
                    </small>
                </div>

                <div className="Field Field--FlexRow">
                    <label className="Field__Label">Current theme:</label>
                    <span className="Settings__CurrentTheme">{theme}</span>
                    <div className="Settings__ThemeBtnWrapper">
                        <button
                            type="button"
                            className="Settings__BtnAction"
                            onClick={() =>
                                useCommandPaletteStore.getState().open("theme")
                            }
                        >
                            Change Theme
                        </button>
                        <button
                            type="button"
                            className="Settings__BtnAction"
                            onClick={randomiseTheme}
                        >
                            Randomise
                        </button>
                    </div>
                </div>

                <div className="Field Field--FlexRow">
                    <label className="Field__Label" htmlFor="uiFontSelect">
                        Primary UI font:
                    </label>
                    <select
                        id="uiFontSelect"
                        className="Field__Input"
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

                <div className="Field Field--FlexRow">
                    <label className="Field__Label" htmlFor="codeFontSelect">
                        Input mono font:
                    </label>
                    <select
                        id="codeFontSelect"
                        className="Field__Input"
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
            </SettingsSection>

            <SettingsSection
                title="Data"
                description="Export or import your items, collections, and settings"
            >
                <div className="Settings__BtnRow">
                    <button
                        className="Settings__BtnAction"
                        type="button"
                        onClick={handleExport}
                    >
                        Export
                    </button>
                    <button
                        className="Settings__BtnAction"
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
                <div className="Settings__BtnRow">
                    <button
                        className="Settings__BtnAction"
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
                    <ImportPreview
                        newItems={importSummary.newItems}
                        updatedItems={importSummary.updatedItems}
                        newCollections={importSummary.newCollections}
                        updatedCollections={importSummary.updatedCollections}
                        onConfirm={handleConfirmImport}
                        onCancel={handleCancelImport}
                    />
                )}
                {pendingJustJotImport && justJotImportSummary && (
                    <ImportPreview
                        newItems={justJotImportSummary.newItems}
                        updatedItems={justJotImportSummary.updatedItems}
                        newCollections={justJotImportSummary.newCollections}
                        updatedCollections={
                            justJotImportSummary.updatedCollections
                        }
                        onConfirm={handleConfirmJustJotImport}
                        onCancel={handleCancelJustJotImport}
                    />
                )}
            </SettingsSection>

            <SettingsSection title="Help">
                <button
                    className="Settings__BtnAction"
                    type="button"
                    onClick={navigateToHelp}
                >
                    Help guide
                </button>
            </SettingsSection>

            <SettingsSection
                title="About"
                onTitleClick={handleDebugEnableClick}
                onTitleKeyDown={handleAboutKeyDown}
            >
                <p className="Settings__Version">
                    Version {APP_VERSION} ({COMMIT_SHA})
                </p>
                <p className="Settings__Version">
                    Made by{" "}
                    <a
                        className="Settings__Link"
                        href="https://JunoNgx.com"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Juno Nguyen
                    </a>
                </p>
                <p className="Settings__Version">
                    <a
                        className="Settings__Link"
                        href="https://github.com/JunoNgx/aijot-frontend"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Source code
                    </a>{" "}
                    (MIT License)
                </p>
                <p className="Settings__Version">
                    <strong>Third party licenses</strong>
                </p>
                <ul className="Settings__Licenses">
                    <li>Monkey Type theme definitions (GPLv3)</li>
                    <li>Standard Book font by Bryce Wilner (SIL OFL v1.1)</li>
                </ul>
                <div className="Settings__BtnRow">
                    <button
                        className="Settings__BtnAction"
                        type="button"
                        onClick={navigateToPrivacy}
                    >
                        Privacy policy
                    </button>
                    <button
                        className="Settings__BtnAction"
                        type="button"
                        onClick={navigateToTerms}
                    >
                        Terms of Services
                    </button>
                </div>
            </SettingsSection>

            <SettingsSection
                title="Danger Zone"
                description="Removes all items and collections. Your data on your cloud storage will remain intact."
                sectionClassName="SettingsSection--Spaced"
                titleClassName="SettingsSection__Title--Danger"
            >
                <button
                    className="Settings__BtnDanger"
                    type="button"
                    onClick={openClearDataDialog}
                >
                    Clear all data
                </button>
            </SettingsSection>

            {isDebugMode && (
                <SettingsSection title="Debug">
                    <button
                        className="Settings__Btn"
                        type="button"
                        onClick={handleTriggerTestToast}
                    >
                        Trigger test toast
                    </button>
                    <p className="SettingsSection__Description">
                        Wipes local database and all local app data. Cannot be
                        undone.
                    </p>
                    <button
                        className="Settings__BtnDanger"
                        type="button"
                        onClick={openResetAppDialog}
                    >
                        Reset app
                    </button>
                </SettingsSection>
            )}
        </div>
    )
}
