import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { LocalSyncDataStore } from "@/types"

export const useLocalSyncData = create<LocalSyncDataStore>()(
    persist(
        (set) => ({
            authToken: undefined,
            rootId: undefined,
            providerName: undefined,
            lastSyncTime: undefined,
            syncStatus: "idle",
            syncError: undefined,
            setAuthToken: (authToken) => set({ authToken }),
            setRootId: (rootId) => set({ rootId }),
            setProviderName: (providerName) => set({ providerName }),
            setLastSyncTime: (lastSyncTime) => set({ lastSyncTime }),
            setSyncStatus: (syncStatus) => set({ syncStatus }),
            setSyncError: (syncError) => set({ syncError }),
        }),
        {
            name: "localSyncData",
            partialize: (state) => ({
                authToken: state.authToken,
                rootId: state.rootId,
                providerName: state.providerName,
                lastSyncTime: state.lastSyncTime,
            }),
        },
    ),
)
