import { useNavigate } from "react-router-dom"
import {
    ROUTE_LANDING,
    ROUTE_JOT,
    ROUTE_COLLECTIONS,
    ROUTE_SETTINGS,
    ROUTE_HELP,
    ROUTE_PRIVACY,
    ROUTE_TERMS,
} from "@/config/constants"

export function useNavigateRoutes() {
    const navigate = useNavigate()
    return {
        navigateToLanding: () => navigate(ROUTE_LANDING),
        navigateToJot: () => navigate(ROUTE_JOT),
        navigateBack: () =>
            window.history.length > 1 ? navigate(-1) : navigate(ROUTE_LANDING),
        navigateToCollection: (slug: string) =>
            navigate(`${ROUTE_JOT}/${slug}`),
        navigateToCollections: () => navigate(ROUTE_COLLECTIONS),
        navigateToSettings: () => navigate(ROUTE_SETTINGS),
        navigateToHelp: () => navigate(ROUTE_HELP),
        navigateToPrivacy: () => navigate(ROUTE_PRIVACY),
        navigateToTerms: () => navigate(ROUTE_TERMS),
    }
}
