import { BACKEND_URL } from "@/config/constants"
import { verifyBackendUrl } from "@/utils/helpers"
import type { LinkFetchResult } from "@/types"

export async function fetchLinkMeta(url: string): Promise<LinkFetchResult> {
    verifyBackendUrl()
    let normalizedUrl: string
    try {
        const urlObj = new URL(url)
        normalizedUrl = urlObj.toString()
    } catch {
        throw new Error("Link is not a valid URL")
    }

    if (!navigator.onLine) {
        throw new Error(
            "You are offline. Link metadata cannot be fetched without internet connection offline",
        )
    }

    try {
        const encodedUrl = encodeURIComponent(normalizedUrl)
        const response = await fetch(
            `${BACKEND_URL}/api/link/fetch?url=${encodedUrl}`,
            {
                method: "GET",
                credentials: "include",
            },
        )

        if (!response.ok) {
            if (response.status === 429) {
                throw new Error(`Rate limit exceeded, please try again later`)
            }

            const errorText = await response.text().catch(() => "Unknown error")
            throw new Error(`Failed to fetch link metadata: ${errorText}`)
        }

        const data = await response.json()
        return data as LinkFetchResult
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to refetch link metadata"
        throw new Error(message)
    }
}
