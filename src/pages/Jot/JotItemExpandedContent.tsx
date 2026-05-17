import { type ReactNode } from "react"
import { formatDetailedDatetime, truncateText } from "@/utils/helpers"
import { JOT_ITEM_EXPANDED_TEXT_DISPLAY_LIMIT } from "@/config/constants"
import { useLocalUserSettings } from "@/store/localUserSettings"
import type { Item } from "@/types"
import "./JotItemExpandedContent.scss"

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

    const isNonTodoTitleLess = item.type !== "todo" && !item.title
    const primaryRowText = isNonTodoTitleLess
        ? expandedSecondaryText
        : expandedPrimaryText
    const shouldShowExtraContentRow =
        !isNonTodoTitleLess && expandedSecondaryText !== null

    const primaryRowClassName = [
        isNonTodoTitleLess
            ? "JotItemExpandedContent__SecondaryText"
            : "JotItemExpandedContent__PrimaryText",
        !isNonTodoTitleLess &&
            item.isDone &&
            item.type === "todo" &&
            "JotItemExpandedContent__PrimaryText--TodoDone",
    ]
        .filter(Boolean)
        .join(" ")

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
