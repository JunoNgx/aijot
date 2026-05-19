import { type ReactNode } from "react"
import { formatDetailedDatetime, truncateText } from "@/utils/helpers"
import {
    JOT_ITEM_EXPANDED_TEXT_DISPLAY_LIMIT,
    REDACTED_PLACEHOLDER,
} from "@/config/constants"
import { useLocalUserSettings } from "@/store/localUserSettings"
import type { Item } from "@/types"
import "./JotItemExpandedLayout.scss"

function computePrimaryRowClasses(
    item: Item,
    shouldUseContentAsPrimary: boolean,
): string {
    if (shouldUseContentAsPrimary) {
        return "JotItemExpandedLayout__SecondaryText"
    }

    if (item.isDone && item.type === "todo") {
        return "JotItemExpandedLayout__PrimaryText JotItemExpandedLayout__PrimaryText--TodoDone"
    }

    return "JotItemExpandedLayout__PrimaryText"
}

interface Props {
    item: Item
    isCopied: boolean
    itemIcon: ReactNode
    itemStatusIndicators: ReactNode
}

export function JotItemExpandedLayout({
    item,
    isCopied,
    itemIcon,
    itemStatusIndicators,
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
    const expandedSecondaryText = item.isRedacted
        ? REDACTED_PLACEHOLDER
        : truncateText(item.content, JOT_ITEM_EXPANDED_TEXT_DISPLAY_LIMIT)

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
        <span className="JotItemExpandedLayout__CopiedText">Copied</span>
    ) : (
        <span
            className={primaryRowClassName}
            title={primaryRowText ?? undefined}
        >
            {primaryRowText}
        </span>
    )

    const extraContentRowTextEl = shouldShowExtraContentRow && (
        <div className="JotItemExpandedLayout__ExtraContentRow">
            <span
                className="JotItemExpandedLayout__SecondaryText"
                title={expandedSecondaryText}
            >
                {expandedSecondaryText}
            </span>
        </div>
    )

    return (
        <div className="JotItemExpandedLayout">
            <div className="JotItemExpandedLayout__PrimaryRow">
                {itemIcon}
                {primaryRowTextEl}
                {itemStatusIndicators}
            </div>
            {extraContentRowTextEl}
            <div className="JotItemExpandedLayout__InfoRow">
                <span className="JotItemExpandedLayout__TagList">
                    {item.tags.length > 0 ? item.tags.join(" ") : "[untagged]"}
                </span>
                <span className="JotItemExpandedLayout__Datetime">
                    {detailedDatetime}
                </span>
            </div>
        </div>
    )
}
