import { useCallback, useState } from "react"
import { toast } from "sonner"
import { useLocalSyncData } from "@/store/localSyncData"
import {
    postAuthCallback,
    postAuthLogout,
    postAuthRefresh,
} from "@/services/googleAuth"
import type { AuthToken, TokenResult } from "@/types"

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ""
const SCOPE = "https://www.googleapis.com/auth/drive.file email"
const TOKEN_EXPIRY_BUFFER_MS = 10 * 60 * 1000

function loadGis(): Promise<void> {
    if (window.google?.accounts?.oauth2) return Promise.resolve()
    return new Promise((resolve, reject) => {
        const script = document.createElement("script")
        script.src = "https://accounts.google.com/gsi/client"
        script.onload = () => resolve()
        script.onerror = () =>
            reject(new Error("Failed to load Google Identity Services"))
        document.head.appendChild(script)
    })
}

function isTokenValid(token: AuthToken): boolean {
    return (
        new Date(token.expiresAt).getTime() - TOKEN_EXPIRY_BUFFER_MS >
        Date.now()
    )
}

export function useGoogleAuth() {
    const { authToken, setAuthToken, setDriveFolderId } = useLocalSyncData()
    const [isConnecting, setIsConnecting] = useState(false)
    const [connectError, setConnectError] = useState<string | null>(null)

    const isConnected = authToken !== undefined

    const connect = useCallback(async () => {
        if (!CLIENT_ID) {
            setConnectError("Google Client ID is not configured.")
            return
        }

        setIsConnecting(true)
        setConnectError(null)

        try {
            await loadGis()
        } catch {
            setConnectError("Failed to load Google Identity Services.")
            setIsConnecting(false)
            return
        }

        const client = window.google?.accounts.oauth2.initCodeClient({
            client_id: CLIENT_ID,
            scope: SCOPE,
            ux_mode: "popup",
            prompt: "consent",
            callback: async (response) => {
                if (response.error) {
                    setConnectError(
                        response.error_description ?? response.error,
                    )
                    setIsConnecting(false)
                    return
                }
                try {
                    const token = await postAuthCallback(response.code)
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
            error_callback: (err) => {
                if (err.type !== "popup_closed") {
                    setConnectError(err.message ?? "Authentication failed.")
                }
                setIsConnecting(false)
            },
        })

        if (!client) {
            setConnectError("Failed to initialise Google Identity Services.")
            setIsConnecting(false)
            return
        }

        client.requestCode()
    }, [setAuthToken])

    const disconnect = useCallback(async () => {
        await postAuthLogout()
        setAuthToken(undefined)
        setDriveFolderId(undefined)
    }, [setAuthToken, setDriveFolderId])

    const getValidToken = useCallback(
        async (shouldForceRefresh = false): Promise<TokenResult> => {
            if (!authToken) return null
            if (!shouldForceRefresh && isTokenValid(authToken)) {
                return authToken.accessToken
            }

            try {
                const refreshedToken = await postAuthRefresh()
                const mergedToken: AuthToken = {
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
        authToken,
        isConnected,
        isConnecting,
        connectError,
        connect,
        disconnect,
        getValidToken,
    }
}
