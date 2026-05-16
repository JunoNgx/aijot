import { Routes, Route, Navigate, Outlet } from "react-router-dom"
import { Toaster } from "sonner"
import Landing from "@/pages/Landing"
import Jot from "@/pages/Jot"
import Collections from "@/pages/Collections"
import Settings from "@/pages/Settings"
import Help from "@/pages/Help"
import Privacy from "@/pages/Privacy"
import Terms from "@/pages/Terms"
import Header from "@/components/Header"
import CommandPaletteManager from "@/components/CommandPaletteManager"
import DialogManager from "@/components/DialogManager"
import ThemeManager from "@/components/ThemeManager"
import FontManager from "@/components/FontManager"
import PurgeManager from "@/components/PurgeManager"
import SyncManager from "@/components/SyncManager"
import { useSyncedUserSettings } from "@/store/syncedUserSettings"
import {
    ROUTE_JOT,
    ROUTE_COLLECTION,
    ROUTE_COLLECTIONS,
    ROUTE_SETTINGS,
    ROUTE_HELP,
    ROUTE_PRIVACY,
    ROUTE_TERMS,
} from "@/config/constants"
import "./App.scss"

function JotRedirect() {
    const defaultCollectionSlug = useSyncedUserSettings(
        (s) => s.defaultCollectionSlug,
    )
    return <Navigate to={`${ROUTE_JOT}/${defaultCollectionSlug}`} replace />
}

function LayoutShell() {
    return (
        <>
            <div className="AppLayout">
                <Header />
                <div className="AppLayout__OutletWrapper">
                    <Outlet />
                </div>
            </div>
        </>
    )
}

export default function App() {
    return (
        <>
            <ThemeManager />
            <FontManager />
            <PurgeManager />
            <SyncManager />
            <DialogManager />
            <CommandPaletteManager />
            <Toaster
                className="SonnerToastContainer"
                position="bottom-center"
                swipeDirections={["left", "right"]}
                mobileOffset={{
                    bottom: "4rem",
                }}
                toastOptions={{
                    unstyled: true,
                    classNames: {
                        toast: "SonnerToast",
                        title: "SonnerToast__Title",
                        description: "SonnerToast__Description",
                        actionButton: "SonnerToast__ActionBtn",
                    },
                }}
            />
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route element={<LayoutShell />}>
                    <Route path={ROUTE_JOT} element={<JotRedirect />} />
                    <Route path={ROUTE_COLLECTION} element={<Jot />} />
                    <Route path={ROUTE_COLLECTIONS} element={<Collections />} />
                    <Route path={ROUTE_SETTINGS} element={<Settings />} />
                    <Route path={ROUTE_HELP} element={<Help />} />
                    <Route path={ROUTE_PRIVACY} element={<Privacy />} />
                    <Route path={ROUTE_TERMS} element={<Terms />} />
                </Route>
            </Routes>
        </>
    )
}
