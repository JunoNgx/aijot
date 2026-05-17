import { type ReactNode } from "react"
import { formatDetailedDatetime } from "@/utils/helpers"
import { useLocalUserSettings } from "@/store/localUserSettings"
import type { Item } from "@/types"
import "./JotItemExpandedContent.scss"

interface Props {
    item: Item
    primaryText: string
    secondaryText: string | null
    isCopied: boolean
    itemIcon: ReactNode
    itemIndicators: ReactNode
}

export function JotItemExpandedContent({
    item,
    primaryText,
    secondaryText,
    isCopied,
    itemIcon,
    itemIndicators,
}: Props) {
    const is24HourClock = useLocalUserSettings((s) => s.is24HourClock)
    const detailedDatetime = formatDetailedDatetime(
        item.jottedAt,
        is24HourClock,
    )

    const isNonTodoTitleLess = item.type !== "todo" && !item.title
    const row1Text = isNonTodoTitleLess ? secondaryText : primaryText
    const shouldShowRow2Secondary =
        !isNonTodoTitleLess && secondaryText !== null

    const row1ClassName = isNonTodoTitleLess
        ? "JotItemExpandedContent__SecondaryText"
        : `JotItemExpandedContent__PrimaryText${item.isDone && item.type === "todo" ? " JotItemExpandedContent__PrimaryText--TodoDone" : ""}`

    return (
        <div className="JotItemExpandedContent">
            <div className="JotItemExpandedContent__Row1">
                {itemIcon}
                {isCopied ? (
                    <span className="JotItemExpandedContent__CopiedText">
                        Copied
                    </span>
                ) : (
                    <span
                        className={row1ClassName}
                        title={row1Text ?? undefined}
                    >
                        {row1Text}
                    </span>
                )}
                {itemIndicators}
            </div>
            {shouldShowRow2Secondary && (
                <div className="JotItemExpandedContent__Row2">
                    <span
                        className="JotItemExpandedContent__SecondaryText"
                        title={secondaryText}
                    >
                        {secondaryText}
                    </span>
                </div>
            )}
            <div className="JotItemExpandedContent__Row3">
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
