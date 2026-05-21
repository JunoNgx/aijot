import { Dropbox, type DropboxResponseError } from "dropbox"
import { BACKEND_URL } from "@/config/constants"
import type { SyncProvider } from "./syncProviderTypes"

const DROPBOX_APP_KEY = import.meta.env.VITE_DROPBOX_APP_KEY ?? ""
const REDIRECT_URI = window.location.origin
const SCOPE =
    "account_info.read files.metadata.read files.metadata.write files.content.read files.content.write"

async function fetchOrThrow(
    url: string,
    options: RequestInit,
): Promise<Response> {
    const res = await fetch(url, options)
    if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? "Request failed")
    }
    return res
}

async function generatePkce(): Promise<{
    verifier: string
    challenge: string
}> {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~"
    const array = new Uint8Array(64)
    crypto.getRandomValues(array)
    const verifier = Array.from(array, (b) => chars[b % chars.length]).join("")

    const encoder = new TextEncoder()
    const digest = await crypto.subtle.digest(
        "SHA-256",
        encoder.encode(verifier),
    )
    const challenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")

    return { verifier, challenge }
}

function openPopup(url: string): Promise<string> {
    const width = 600
    const height = 700
    const left = Math.max(
        0,
        Math.round(window.screenX + (window.innerWidth - width) / 2),
    )
    const top = Math.max(
        0,
        Math.round(window.screenY + (window.innerHeight - height) / 2),
    )

    const popup = window.open(
        url,
        "dropbox-auth",
        `width=${width},height=${height},left=${left},top=${top},popup=true`,
    )

    if (!popup) {
        throw new Error("Popup was blocked. Please allow popups for this site.")
    }

    return new Promise<string>((resolve, reject) => {
        const interval = setInterval(() => {
            let href: string
            try {
                href = popup.location.href
            } catch {
                return
            }

            if (!href.startsWith(REDIRECT_URI)) return

            clearInterval(interval)
            popup.close()

            const urlObj = new URL(href)
            const code = urlObj.searchParams.get("code")
            const error = urlObj.searchParams.get("error")

            if (error) {
                reject(new Error(`Authentication failed: ${error}`))
                return
            }

            if (code) {
                resolve(code)
            } else {
                reject(new Error("No authorization code received"))
            }
        }, 300)

        const checkClosed = setInterval(() => {
            if (popup.closed) {
                clearInterval(interval)
                clearInterval(checkClosed)
                reject(new Error("Authentication cancelled"))
            }
        }, 500)
    })
}

export const dropboxProvider: SyncProvider = {
    name: "dropbox",
    connectLabel: "Dropbox",
    expiredMessage: "Dropbox session expired. Please reconnect in Settings.",
    revokedMessage:
        "Dropbox access was revoked or has insufficient permissions. Please reconnect in Settings.",

    async connect() {
        if (!DROPBOX_APP_KEY) {
            throw new Error("Dropbox App Key is not configured.")
        }

        const { verifier, challenge } = await generatePkce()

        const authUrl = new URL("https://www.dropbox.com/oauth2/authorize")
        authUrl.searchParams.set("response_type", "code")
        authUrl.searchParams.set("client_id", DROPBOX_APP_KEY)
        authUrl.searchParams.set("redirect_uri", REDIRECT_URI)
        authUrl.searchParams.set("code_challenge", challenge)
        authUrl.searchParams.set("code_challenge_method", "S256")
        authUrl.searchParams.set("token_access_type", "offline")
        authUrl.searchParams.set("scope", SCOPE)

        const code = await openPopup(authUrl.toString())

        const res = await fetchOrThrow(
            `${BACKEND_URL}/api/auth/dropbox/callback`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    code,
                    code_verifier: verifier,
                    redirect_uri: REDIRECT_URI,
                }),
            },
        )

        const data = await res.json()
        return {
            provider: "dropbox",
            accessToken: data.accessToken,
            expiresAt: data.expiresAt,
            email: data.email,
        }
    },

    async disconnect() {
        await fetchOrThrow(`${BACKEND_URL}/api/auth/dropbox/logout`, {
            method: "POST",
            credentials: "include",
        })
    },

    async refreshAuthToken(_token) {
        const res = await fetchOrThrow(
            `${BACKEND_URL}/api/auth/dropbox/refresh`,
            {
                method: "POST",
                credentials: "include",
            },
        )

        const data = await res.json()
        return {
            accessToken: data.accessToken,
            expiresAt: data.expiresAt,
        }
    },

    isScopeError(err) {
        if (!(err instanceof Error)) return false
        const message = err.message.toLowerCase()
        return (
            message.includes("403") &&
            message.includes("insufficient_permissions")
        )
    },

    async getOrCreateRoot(_token) {
        return ""
    },

    async findFile(token, _rootId, name) {
        const client = new Dropbox({ accessToken: token })
        try {
            const response = await client.filesGetMetadata({
                path: `/${name}`,
            })
            const result = response.result as {
                ".tag": string
                id: string
                name: string
                path_display?: string
                server_modified: string
            }
            return {
                id: result.path_display ?? `/${name}`,
                name: result.name,
                modifiedTime: result.server_modified,
            }
        } catch (err) {
            const dropboxErr = err as DropboxResponseError<unknown>
            if (dropboxErr.status === 409) return null
            throw err
        }
    },

    async downloadFile(token, fileId) {
        const client = new Dropbox({ accessToken: token })
        const response = await client.filesDownload({ path: fileId })
        const blob = (response.result as unknown as { fileBlob: Blob }).fileBlob
        const text = await blob.text()
        return JSON.parse(text)
    },

    async upsertFile(token, _rootId, name, data) {
        const client = new Dropbox({ accessToken: token })
        await client.filesUpload({
            path: `/${name}`,
            contents: JSON.stringify(data, null, 2),
            mode: { ".tag": "overwrite" },
        })
    },
}
