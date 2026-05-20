import { useCallback, useState } from "react"
import { toast } from "sonner"
import { useLocalSyncData } from "@/store/localSyncData"
import { googleProvider } from "@/services/googleProvider"
import type {
    SyncAuthToken,
    SyncProvider,
    SyncProviderName,
    SyncTokenResult,
} from "@/services/syncProviderTypes"

const providers: Record<string, SyncProvider> = {
    google: googleProvider,
}

function isTokenValid(token: SyncAuthToken): boolean {
    const TOKEN_EXPIRY_BUFFER_MS = 10 * 60 * 1000
    return (
        new Date(token.expiresAt).getTime() - TOKEN_EXPIRY_BUFFER_MS >
        Date.now()
    )
}

export function useSyncProvider() {
    const { authToken, setAuthToken, setRootId, setProviderName } =
        useLocalSyncData()
    const [isConnecting, setIsConnecting] = useState(false)
    const [connectError, setConnectError] = useState<string | null>(null)

    const isConnected = authToken !== undefined

    const activeProvider = authToken
        ? (providers[authToken.provider] ?? null)
        : null

    const connect = useCallback(
        async (name: SyncProviderName) => {
            const provider = providers[name]
            if (!provider) return

            if (authToken && authToken.provider !== name) {
                await providers[authToken.provider]?.disconnect()
                setRootId(undefined)
                setAuthToken(undefined)
            }

            setIsConnecting(true)
            setConnectError(null)

            try {
                const token = await provider.connect()
                setProviderName(name)
                setAuthToken(token)
                toast.success(`Connected as ${token.email}`)
            } catch (err) {
                setConnectError(
                    err instanceof Error
                        ? err.message
                        : "Authentication failed.",
                )
            } finally {
                setIsConnecting(false)
            }
        },
        [authToken, setAuthToken, setProviderName, setRootId],
    )

    const disconnect = useCallback(async () => {
        if (activeProvider) await activeProvider.disconnect()
        setAuthToken(undefined)
        setRootId(undefined)
        setProviderName(undefined)
    }, [activeProvider, setAuthToken, setRootId, setProviderName])

    const getValidToken = useCallback(
        async (shouldForceRefresh = false): Promise<SyncTokenResult> => {
            if (!authToken || !activeProvider) return null
            if (!shouldForceRefresh && isTokenValid(authToken)) {
                return authToken.accessToken
            }

            try {
                const refreshedToken =
                    await activeProvider.refreshAuthToken(authToken)
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
        [authToken, activeProvider, setAuthToken],
    )

    return {
        provider: activeProvider,
        authToken,
        isConnected,
        isConnecting,
        connectError,
        connect,
        disconnect,
        getValidToken,
    }
}
