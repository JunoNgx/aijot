import { useEffect } from "react"
import { purgeExpiredData } from "@/db"

export default function PurgeManager() {
    useEffect(() => {
        purgeExpiredData()

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                purgeExpiredData()
            }
        }

        document.addEventListener("visibilitychange", handleVisibilityChange)
        return () =>
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange,
            )
    }, [])

    return null
}
