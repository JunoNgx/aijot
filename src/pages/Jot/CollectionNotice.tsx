import DemoDataBanner from "./DemoDataBanner"
import SyncButton from "@/components/SyncButton"
import { TRASH_PURGE_DURATION_DAY } from "@/config/constants"
import type { Collection } from "@/types"
import "./CollectionNotice.scss"

interface CollectionNoticeProps {
    shouldShowDemoDataBanner: boolean
    isTrash: boolean
    collection: Collection | undefined
}

export default function CollectionNotice({
    shouldShowDemoDataBanner,
    isTrash,
    collection,
}: CollectionNoticeProps) {
    const displayTags = collection
        ? collection.coreType === "untagged"
            ? ["[untagged]"]
            : collection.tags
        : [""]

    return (
        <div className="CollectionNotice">
            <div className="CollectionNotice__SyncWrapper">
                <SyncButton />
            </div>
            {shouldShowDemoDataBanner && <DemoDataBanner />}
            {isTrash && (
                <p className="CollectionNotice__Text">
                    Items in trash are automatically deleted after{" "}
                    {TRASH_PURGE_DURATION_DAY} days
                </p>
            )}
            {collection && displayTags.length > 0 && (
                <div className="CollectionNotice__TagsWrapper">
                    <span className="CollectionNotice__TagsLabel">
                        Showing tags:
                    </span>{" "}
                    <span className="CollectionNotice__TagsContent">
                        {displayTags.join(" ")}
                    </span>
                </div>
            )}
        </div>
    )
}
