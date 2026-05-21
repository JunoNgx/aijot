/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_GOOGLE_CLIENT_ID: string
    readonly VITE_DROPBOX_APP_KEY: string
    readonly VERCEL_GIT_COMMIT_SHA?: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
