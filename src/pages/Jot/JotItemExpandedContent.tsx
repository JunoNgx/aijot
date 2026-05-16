import { type ReactNode } from "react"
import styles from "./JotItemExpandedContent.module.scss"

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
        <div className={styles.JotItemExpandedContent}>
            <div className={styles.JotItemExpandedContent__Row1}>
                {itemIcon}
                {mainContentEl}
                {itemIndicators}
            </div>
            <div className={styles.JotItemExpandedContent__Row2}>
                {tagsEl}
                <span className={styles.JotItemExpandedContent__Row2Right}>
                    {expandedDatetimeEl}
                </span>
            </div>
        </div>
    )
}
