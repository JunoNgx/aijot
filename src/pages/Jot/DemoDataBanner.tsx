import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useLocalAppData } from "@/store/localAppData"
import { storage } from "@/db"
import { queryKeys } from "@/db/queryKeys"
import { buildDemoCollections, buildDemoItems } from "@/utils/itemFactory"
import "./DemoDataBanner.scss"

export default function DemoDataBanner() {
    const { setShouldShowDemoDataBanner } = useLocalAppData()
    const queryClient = useQueryClient()
    const [isLoadingDemoData, setIsLoadingDemoData] = useState(false)

    const handleDismiss = () => {
        setShouldShowDemoDataBanner(false)
    }

    const handleLoadDemoData = async () => {
        setIsLoadingDemoData(true)
        try {
            await Promise.all([
                storage.bulkPutItems(buildDemoItems()),
                storage.bulkPutCollections(buildDemoCollections()),
            ])
            queryClient.invalidateQueries({ queryKey: queryKeys.items })
            queryClient.invalidateQueries({ queryKey: queryKeys.collections })
            setShouldShowDemoDataBanner(false)
        } finally {
            setIsLoadingDemoData(false)
        }
    }

    return (
        <div className="DemoDataBanner">
            <div className="DemoDataBanner__Text">
                Welcome (back) to ai*jot. If you're new, try having a tour with
                the demo data. Or{" "}
                <button
                    className="DemoDataBanner__BtnDismiss"
                    onClick={handleDismiss}
                >
                    dismiss this
                </button>
                .
            </div>
            <button
                className="DemoDataBanner__BtnLoad"
                disabled={isLoadingDemoData}
                onClick={handleLoadDemoData}
            >
                {isLoadingDemoData ? "Loading..." : "Load demo data"}
            </button>
        </div>
    )
}
