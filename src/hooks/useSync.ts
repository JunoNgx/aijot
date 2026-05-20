import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useRef } from "react"
import { toast } from "sonner"
import { runFullSync } from "@/services/syncEngine"
import { useLocalSyncData } from "@/store/localSyncData"
import type { SyncTokenResult } from "@/services/syncProviderTypes"
import { useSyncProvider } from "./useSyncProvider"

const DEBOUNCE_MS = 15_000
const RESTORE_SYNC_THRESHOLD_MS = 24 * 60 * 60 * 1000

let isSyncing = false

function isExpiredResult(
    result: SyncTokenResult,
): result is { expired: string } {
    return typeof result === "object" && result !== null
}

function isAuthError(err: unknown): boolean {
    return err instanceof Error && err.message.includes("401")
}

export function useSyncFn() {
    const {
        rootId,
        setRootId,
        setSyncStatus,
        setLastSyncTime,
        setSyncError,
        setAuthToken,
    } = useLocalSyncData()

    const { provider, getValidToken } = useSyncProvider()
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
            if (!provider) {
                isSyncing = false
                return
            }
            if (isExpiredResult(tokenResult)) {
                handleAuthExpired(provider.expiredMessage)
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
                let currentRootId = rootId
                if (!currentRootId) {
                    currentRootId = await provider.getOrCreateRoot(token)
                    setRootId(currentRootId)
                }

                const syncStartTime = await runFullSync(
                    token,
                    currentRootId,
                    provider,
                )
                await queryClient.invalidateQueries()

                setSyncStatus("idle")
                setLastSyncTime(syncStartTime)
                toast.dismiss("auth-reconnect")
                if (!isSilent) {
                    toast.success("Sync complete")
                }
            } catch (err) {
                if (provider.isScopeError(err)) {
                    setSyncStatus("idle")
                    setAuthToken(undefined)
                    toast.error(provider.revokedMessage, {
                        id: "auth-reconnect",
                        duration: Infinity,
                    })
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
                    handleAuthExpired(provider.expiredMessage)
                    return
                }

                setSyncStatus("idle")
            } finally {
                isSyncing = false
            }
        },
        [
            rootId,
            provider,
            getValidToken,
            queryClient,
            setRootId,
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

    useEffect(() => {
        return queryClient.getMutationCache().subscribe((event) => {
            if (event.mutation?.state.status === "success") {
                debouncedSync()
            }
        })
    }, [queryClient, debouncedSync])

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
