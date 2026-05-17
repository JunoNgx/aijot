import { type ReactNode } from "react"
import "./JotItemExpandedContent.scss"

interface Props {
    mainContentEl: ReactNode
    itemIcon: ReactNode
    itemIndicators: ReactNode
    tagsEl: ReactNode
    expandedDatetimeEl: ReactNode
}

export function JotItemExpandedContent({
    mainContentEl,
    itemIcon,
    itemIndicators,
    tagsEl,
    expandedDatetimeEl,
}: Props) {
    return (
        <div className="JotItemExpandedContent">
            <div className="JotItemExpandedContent__Row1">
                {itemIcon}
                {mainContentEl}
                {itemIndicators}
            </div>
            <div className="JotItemExpandedContent__Row2">
                {tagsEl}
                {expandedDatetimeEl}
            </div>
        </div>
    )
}
