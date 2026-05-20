import { useCallback, useState } from "react"
import { toast } from "sonner"
import { useLocalSyncData } from "@/store/localSyncData"
import { googleProvider } from "@/services/googleProvider"
import type {
    SyncAuthToken,
    SyncTokenResult,
} from "@/services/syncProviderTypes"

function isTokenValid(token: SyncAuthToken): boolean {
    const TOKEN_EXPIRY_BUFFER_MS = 10 * 60 * 1000
    return (
        new Date(token.expiresAt).getTime() - TOKEN_EXPIRY_BUFFER_MS >
        Date.now()
    )
}

export function useSyncProvider() {
    const { authToken, setAuthToken, setRootId } = useLocalSyncData()
    const [isConnecting, setIsConnecting] = useState(false)
    const [connectError, setConnectError] = useState<string | null>(null)

    const isConnected = authToken !== undefined

    const connect = useCallback(async () => {
        setIsConnecting(true)
        setConnectError(null)

        try {
            const token = await googleProvider.connect()
            setAuthToken(token)
            toast.success(`Connected as ${token.email}`)
        } catch (err) {
            setConnectError(
                err instanceof Error ? err.message : "Authentication failed.",
            )
        } finally {
            setIsConnecting(false)
        }
    }, [setAuthToken])

    const disconnect = useCallback(async () => {
        await googleProvider.disconnect()
        setAuthToken(undefined)
        setRootId(undefined)
    }, [setAuthToken, setRootId])

    const getValidToken = useCallback(
        async (shouldForceRefresh = false): Promise<SyncTokenResult> => {
            if (!authToken) return null
            if (!shouldForceRefresh && isTokenValid(authToken)) {
                return authToken.accessToken
            }

            try {
                const refreshedToken =
                    await googleProvider.refreshAuthToken(authToken)
                const mergedToken: SyncAuthToken = {
                    ...authToken,
                    accessToken: refreshedToken.accessToken,
                    expiresAt: refreshedToken.expiresAt,
                }
                setAuthToken(mergedToken)
                return mergedToken.accessToken
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Token refresh failed"
                return { expired: message }
            }
        },
        [authToken, setAuthToken],
    )

    return {
        provider: googleProvider,
        authToken,
        isConnected,
        isConnecting,
        connectError,
        connect,
        disconnect,
        getValidToken,
    }
}
