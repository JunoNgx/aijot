import { type ReactNode } from "react"
import { formatDetailedDatetime } from "@/utils/helpers"
import { useLocalUserSettings } from "@/store/localUserSettings"
import type { Item } from "@/types"
import "./JotItemExpandedContent.scss"

interface Props {
    item: Item
    mainContentEl: ReactNode
    itemIcon: ReactNode
    itemIndicators: ReactNode
}

export function JotItemExpandedContent({
    item,
    mainContentEl,
    itemIcon,
    itemIndicators,
}: Props) {
    const is24HourClock = useLocalUserSettings((s) => s.is24HourClock)
    const detailedDatetime = formatDetailedDatetime(
        item.jottedAt,
        is24HourClock,
    )

    return (
        <div className="JotItemExpandedContent">
            <div className="JotItemExpandedContent__Row1">
                {itemIcon}
                {mainContentEl}
                {itemIndicators}
            </div>
            <div className="JotItemExpandedContent__Row2">
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
