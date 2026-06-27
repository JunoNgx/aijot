export type SyncProviderName = "google" | "dropbox"

export interface SyncAuthToken {
    provider: SyncProviderName
    accessToken: string
    expiresAt: string
    email: string
}

export type SyncTokenResult = string | null | { expiredMessage: string }

export interface SyncFile {
    id: string
    name: string
    modifiedTime: string
}

export interface SyncProvider {
    readonly name: string
    readonly connectLabel: string
    readonly expiredMessage: string
    readonly revokedMessage: string

    connect(): Promise<SyncAuthToken>
    disconnect(): Promise<void>
    refreshAuthToken(
        token: SyncAuthToken,
    ): Promise<Pick<SyncAuthToken, "accessToken" | "expiresAt">>
    isScopeError(err: unknown): boolean

    getOrCreateRoot(token: string): Promise<string>
    findFile(
        token: string,
        rootId: string,
        name: string,
    ): Promise<SyncFile | null>
    downloadFile<T>(token: string, fileId: string): Promise<T>
    upsertFile(
        token: string,
        rootId: string,
        name: string,
        data: unknown,
        knownFileId?: string,
    ): Promise<void>
}
