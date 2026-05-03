import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useRef } from "react"
import { toast } from "sonner"
import { getOrCreateAijotFolder } from "@/services/driveClient"
import { runFullDriveSync } from "@/services/driveSync"
import { useLocalSyncData } from "@/store/localSyncData"
import type { TokenResult } from "@/types"
import { useGoogleAuth } from "./useGoogleAuth"

const DEBOUNCE_MS = 15_000
const RESTORE_SYNC_THRESHOLD_MS = 24 * 60 * 60 * 1000

// Module-level flag prevents concurrent syncs across hook instances.
let isSyncing = false

function isExpiredResult(result: TokenResult): result is { expired: string } {
    return typeof result === "object" && result !== null
}

function isAuthError(err: unknown): boolean {
    return err instanceof Error && err.message.includes("401")
}

function isScopeError(err: unknown): boolean {
    if (!(err instanceof Error)) return false
    const message = err.message.toLowerCase()
    return (
        message.includes("403") &&
        (message.includes("insufficient authentication scopes") ||
            message.includes("access_token_scope_insufficient"))
    )
}

export function useSyncFn() {
    const {
        driveFolderId,
        setDriveFolderId,
        setSyncStatus,
        setLastSyncTime,
        setSyncError,
        setAuthToken,
    } = useLocalSyncData()

    const { getValidToken } = useGoogleAuth()
    const queryClient = useQueryClient()

    const handleAuthExpired = useCallback(
        (toastMessage: string) => {
            if (navigator.onLine) setAuthToken(undefined)
            toast.error(toastMessage, {
                id: "auth-reconnect",
                duration: Infinity,
            })
        },
        [setAuthToken],
    )

    const sync = useCallback(
        async (isSilent = false) => {
            if (isSyncing) return
            isSyncing = true

            const tokenResult = await getValidToken()
            if (isExpiredResult(tokenResult)) {
                handleAuthExpired(
                    "Google Drive session expired. Please reconnect in Settings.",
                )
                isSyncing = false
                return
            }
            if (!tokenResult) {
                isSyncing = false
                return
            }
            const token = tokenResult

            setSyncStatus("syncing")
            setSyncError(undefined)

            try {
                let folderId = driveFolderId
                if (!folderId) {
                    folderId = await getOrCreateAijotFolder(token)
                    setDriveFolderId(folderId)
                }

                const syncStartTime = await runFullDriveSync(token, folderId)
                await queryClient.invalidateQueries()

                setSyncStatus("idle")
                setLastSyncTime(syncStartTime)
                toast.dismiss("auth-reconnect")
                if (!isSilent) {
                    toast.success("Sync complete")
                }
            } catch (err) {
                if (isScopeError(err)) {
                    setSyncStatus("idle")
                    setAuthToken(undefined)
                    toast.error(
                        "Google Drive access was revoked or has insufficient permissions. Please reconnect in Settings.",
                        { id: "auth-reconnect", duration: Infinity },
                    )
                    return
                }

                if (!isAuthError(err)) {
                    const message =
                        err instanceof Error ? err.message : "Sync failed."
                    setSyncStatus("error")
                    setSyncError(message)
                    toast.error(`Sync failed: ${message}`)
                    return
                }

                const refreshedTokenResult = await getValidToken(true)
                if (isExpiredResult(refreshedTokenResult)) {
                    setSyncStatus("idle")
                    handleAuthExpired(
                        "Google Drive session expired mid-sync. Please reconnect in Settings.",
                    )
                    return
                }

                setSyncStatus("idle")
            } finally {
                isSyncing = false
            }
        },
        [
            driveFolderId,
            getValidToken,
            queryClient,
            setDriveFolderId,
            setLastSyncTime,
            setSyncError,
            setSyncStatus,
            setAuthToken,
            handleAuthExpired,
        ],
    )

    return { sync }
}

function isSyncStale(lastSyncTime: string | undefined): boolean {
    if (!lastSyncTime) return true
    return (
        Date.now() - new Date(lastSyncTime).getTime() >
        RESTORE_SYNC_THRESHOLD_MS
    )
}

export function useSync() {
    const { sync } = useSyncFn()
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const queryClient = useQueryClient()

    const debouncedSync = useCallback(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => sync(true), DEBOUNCE_MS)
    }, [sync])

    // Trigger debounced sync after any successful mutation
    useEffect(() => {
        return queryClient.getMutationCache().subscribe((event) => {
            if (event.mutation?.state.status === "success") {
                debouncedSync()
            }
        })
    }, [queryClient, debouncedSync])

    // Flush pending debounce on hide; sync on restore if last sync was stale
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden") {
                if (debounceRef.current) {
                    clearTimeout(debounceRef.current)
                    debounceRef.current = null
                }
                return
            }
            const { lastSyncTime } = useLocalSyncData.getState()
            if (isSyncStale(lastSyncTime)) sync(true)
        }
        document.addEventListener("visibilitychange", handleVisibilityChange)
        return () =>
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange,
            )
    }, [sync])

    return { sync }
}
