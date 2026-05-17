import { type ReactNode } from "react"
import { formatDetailedDatetime, truncateText } from "@/utils/helpers"
import { JOT_ITEM_EXPANDED_TEXT_DISPLAY_LIMIT } from "@/config/constants"
import { useLocalUserSettings } from "@/store/localUserSettings"
import type { Item } from "@/types"
import "./JotItemExpandedContent.scss"

function computePrimaryRowClasses(
    item: Item,
    shouldUseContentAsPrimary: boolean,
): string {
    if (shouldUseContentAsPrimary) {
        return "JotItemExpandedContent__SecondaryText"
    }

    if (item.isDone && item.type === "todo") {
        return "JotItemExpandedContent__PrimaryText JotItemExpandedContent__PrimaryText--TodoDone"
    }

    return "JotItemExpandedContent__PrimaryText"
}

interface Props {
    item: Item
    isCopied: boolean
    itemIcon: ReactNode
    itemIndicators: ReactNode
}

export function JotItemExpandedContent({
    item,
    isCopied,
    itemIcon,
    itemIndicators,
}: Props) {
    const is24HourClock = useLocalUserSettings((s) => s.is24HourClock)
    const detailedDatetime = formatDetailedDatetime(
        item.jottedAt,
        is24HourClock,
    )

    const expandedPrimaryText = truncateText(
        item.type === "todo" ? item.content : item.title,
        JOT_ITEM_EXPANDED_TEXT_DISPLAY_LIMIT,
    )
    const expandedSecondaryText = truncateText(
        item.content,
        JOT_ITEM_EXPANDED_TEXT_DISPLAY_LIMIT,
    )

    const shouldUseContentAsPrimary = item.type !== "todo" && !item.title
    const primaryRowText = shouldUseContentAsPrimary
        ? expandedSecondaryText
        : expandedPrimaryText
    const shouldShowExtraContentRow =
        !shouldUseContentAsPrimary && expandedSecondaryText !== null

    const primaryRowClassName = computePrimaryRowClasses(
        item,
        shouldUseContentAsPrimary,
    )

    const primaryRowTextEl = isCopied ? (
        <span className="JotItemExpandedContent__CopiedText">Copied</span>
    ) : (
        <span
            className={primaryRowClassName}
            title={primaryRowText ?? undefined}
        >
            {primaryRowText}
        </span>
    )

    const extraContentRowTextEl = shouldShowExtraContentRow && (
        <div className="JotItemExpandedContent__ExtraContentRow">
            <span
                className="JotItemExpandedContent__SecondaryText"
                title={expandedSecondaryText}
            >
                {expandedSecondaryText}
            </span>
        </div>
    )

    return (
        <div className="JotItemExpandedContent">
            <div className="JotItemExpandedContent__PrimaryRow">
                {itemIcon}
                {primaryRowTextEl}
                {itemIndicators}
            </div>
            {extraContentRowTextEl}
            <div className="JotItemExpandedContent__InfoRow">
                <span className="JotItemExpandedContent__TagList">
                    {item.tags.length > 0 ? item.tags.join(" ") : "[untagged]"}
                </span>
                <span className="JotItemExpandedContent__Datetime">
                    {detailedDatetime}
                </span>
            </div>
        </div>
    )
}
