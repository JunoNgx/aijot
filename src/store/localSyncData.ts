import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { LocalSyncDataStore } from "@/types"

export const useLocalSyncData = create<LocalSyncDataStore>()(
    persist(
        (set) => ({
            authToken: undefined,
            rootId: undefined,
            lastSyncTime: undefined,
            syncStatus: "idle",
            syncError: undefined,
            setAuthToken: (authToken) => set({ authToken }),
            setRootId: (rootId) => set({ rootId }),
            setLastSyncTime: (lastSyncTime) => set({ lastSyncTime }),
            setSyncStatus: (syncStatus) => set({ syncStatus }),
            setSyncError: (syncError) => set({ syncError }),
        }),
        {
            name: "localSyncData",
            partialize: (state) => ({
                authToken: state.authToken,
                rootId: state.rootId,
                lastSyncTime: state.lastSyncTime,
            }),
        },
    ),
)
