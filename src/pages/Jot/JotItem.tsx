import { useState, type MouseEvent, memo, type ReactNode } from "react"
import * as ContextMenu from "@radix-ui/react-context-menu"
import {
    IconNote,
    IconLink,
    IconWorld,
    IconSquare,
    IconCheckbox,
    IconClipboard,
    IconHourglassLow,
    IconPinFilled,
} from "@tabler/icons-react"
import {
    isValidHexColourCode,
    formatDatetime,
    formatDetailedDatetime,
    truncateText,
} from "@/utils/helpers"
import {
    ICON_PROPS_ITEM_ICON,
    ICON_PROPS_ITEM_STATUS,
    JOT_ITEM_PRIMARY_TEXT_DISPLAY_LIMIT,
    JOT_ITEM_SECONDARY_TEXT_DISPLAY_LIMIT,
} from "@/config/constants"
import { useLocalUserSettings } from "@/store/localUserSettings"
import { useTransientUiState } from "@/store/transientUiState"
import { useItemActions } from "@/hooks/useItemActions"
import JotItemContextMenu from "./JotItemContextMenu"
import type { Item } from "@/types"
import styles from "./JotItem.module.scss"

interface Props {
    item: Item
    isSelected: boolean
    itemIndex: number
    isExpandedInfoMode: boolean
    id?: string
}

function FaviconIcon({ url }: { url: string }) {
    const [hasFailed, setHasFailed] = useState(false)
    if (hasFailed) return <IconLink {...ICON_PROPS_ITEM_ICON} />
    return (
        <img
            src={url}
            onError={() => setHasFailed(true)}
            className={styles.JotItem__Favicon}
            alt=""
        />
    )
}

function ItemIcon({
    item,
    fetchingItemIds,
}: {
    item: Item
    fetchingItemIds: string[]
}) {
    if (fetchingItemIds.includes(item.id)) {
        return <IconHourglassLow {...ICON_PROPS_ITEM_ICON} />
    }

    if (item.type === "todo") {
        return item.isDone ? (
            <IconCheckbox {...ICON_PROPS_ITEM_ICON} />
        ) : (
            <IconSquare {...ICON_PROPS_ITEM_ICON} />
        )
    }
    if (item.type === "link") {
        if (item.faviconUrl) return <FaviconIcon url={item.faviconUrl} />
        return <IconWorld {...ICON_PROPS_ITEM_ICON} />
    }
    const lastSevenChars = item.content.slice(-7)
    if (isValidHexColourCode(lastSevenChars)) {
        return (
            <span
                className={styles.JotItem__ColourBlock}
                style={{ backgroundColor: lastSevenChars }}
            />
        )
    }
    return <IconNote {...ICON_PROPS_ITEM_ICON} />
}

interface JotItemExpandedContentProps {
    displayPrimaryText: string
    isPrimaryTextTitle: boolean
    itemIsDone: boolean | undefined
    itemIcon: ReactNode
    itemIndicators: ReactNode
    secondaryTextEl: ReactNode
    tagsEl: ReactNode
    expandedDatetimeEl: ReactNode
}

function JotItemExpandedContent({
    displayPrimaryText,
    isPrimaryTextTitle,
    itemIsDone,
    itemIcon,
    itemIndicators,
    secondaryTextEl,
    tagsEl,
    expandedDatetimeEl,
}: JotItemExpandedContentProps) {
    return (
        <div className={styles.JotItemExpandedContent}>
            <div className={styles.JotItemExpandedContent__Row1}>
                {itemIcon}
                <span
                    className={[
                        styles.JotItem__PrimaryText,
                        itemIsDone
                            ? styles["JotItem__PrimaryText--TodoDone"]
                            : "",
                        isPrimaryTextTitle
                            ? styles["JotItem__PrimaryText--Title"]
                            : "",
                    ].join(" ")}
                >
                    {displayPrimaryText}
                </span>
                {secondaryTextEl}
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

export default memo(function JotItem({
    item,
    isSelected,
    itemIndex,
    isExpandedInfoMode,
    id,
}: Props) {
    const { triggerPrimaryAction } = useItemActions()
    const is24HourClock = useLocalUserSettings((s) => s.is24HourClock)
    const copiedItemIds = useTransientUiState((s) => s.copiedItemIds)
    const fetchingLinkMetaItemIds = useTransientUiState(
        (s) => s.fetchingLinkMetaItemIds,
    )
    const isPrimaryTextTitle = item.type !== "todo" && item.title !== undefined
    const primaryText = isPrimaryTextTitle ? item.title! : item.content
    const secondaryText = isPrimaryTextTitle ? item.content : null
    const displayPrimaryText = truncateText(
        primaryText,
        JOT_ITEM_PRIMARY_TEXT_DISPLAY_LIMIT,
    )
    const displaySecondaryText = secondaryText
        ? truncateText(secondaryText, JOT_ITEM_SECONDARY_TEXT_DISPLAY_LIMIT)
        : null
    const datetime = formatDatetime(item.jottedAt, is24HourClock)
    const detailedDatetime = formatDetailedDatetime(
        item.jottedAt,
        is24HourClock,
    )

    const secondaryTextEl = displaySecondaryText && (
        <span className={styles.JotItem__SecondaryText}>
            {displaySecondaryText}
        </span>
    )

    const rootClassName = [
        styles.JotItem,
        isSelected ? styles["JotItem--Selected"] : "",
        isExpandedInfoMode ? styles["JotItem--Expanded"] : "",
    ].join(" ")

    const getAccessibleLabel = () => {
        const typeLabel =
            item.type === "todo"
                ? item.isDone
                    ? "Completed todo"
                    : "Todo"
                : item.type === "link"
                  ? "Link"
                  : "Text"

        return [typeLabel, truncateText(primaryText, 100)]
            .filter(Boolean)
            .join(": ")
    }

    const itemIndicators = (
        <div className={styles.JotItem__StatusWrapper}>
            {item.shouldCopyOnClick && (
                <span
                    className={styles.JotItem__StatusIcon}
                    aria-label="Auto-copy on click"
                >
                    <IconClipboard {...ICON_PROPS_ITEM_STATUS} />
                </span>
            )}
            {item.isPinned && (
                <span
                    className={`
                        ${styles.JotItem__StatusIcon}
                        ${styles["JotItem__StatusIcon--Pin"]}
                    `}
                    aria-label="Pinned"
                >
                    <IconPinFilled {...ICON_PROPS_ITEM_STATUS} />
                </span>
            )}
        </div>
    )

    const isCopied = copiedItemIds.includes(item.id)
    const itemBody = isCopied ? (
        <div className={styles.JotItem__Body} key="copied">
            <span
                className={`${styles.JotItem__PrimaryText} ${styles.JotItem__Copied}`}
            >
                Copied
            </span>
        </div>
    ) : (
        <div className={styles.JotItem__Body}>
            <span
                className={[
                    styles.JotItem__PrimaryText,
                    item.isDone ? styles["JotItem__PrimaryText--TodoDone"] : "",
                    isPrimaryTextTitle
                        ? styles["JotItem__PrimaryText--Title"]
                        : "",
                ].join(" ")}
            >
                {displayPrimaryText}
            </span>
            {secondaryTextEl}
        </div>
    )

    const itemIcon = (
        <span className={styles.JotItem__Icon}>
            <ItemIcon item={item} fetchingItemIds={fetchingLinkMetaItemIds} />
        </span>
    )

    const tagsEl = (
        <span className={styles.JotItem__Tags}>
            {item.tags.length > 0 ? item.tags.join(" ") : "[untagged]"}
        </span>
    )

    const compactDatetimeEl = (
        <span className={styles.JotItem__Datetime}>{datetime}</span>
    )

    const expandedDatetimeEl = (
        <span className={styles.JotItem__Datetime}>{detailedDatetime}</span>
    )

    const compactContent = (
        <>
            {itemIcon}
            {itemBody}
            {itemIndicators}
            {compactDatetimeEl}
        </>
    )

    const wrapperProps =
        item.type === "link"
            ? {
                  as: "a" as const,
                  href: item.content,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  onClick: (e: MouseEvent) => {
                      triggerPrimaryAction(item, e)
                  },
              }
            : {
                  as: "button" as const,
                  onClick: (e: MouseEvent) => {
                      triggerPrimaryAction(item, e)
                  },
              }
    const { as: Tag, ...rest } = wrapperProps

    return (
        <ContextMenu.Root>
            <ContextMenu.Trigger asChild>
                <Tag
                    className={rootClassName}
                    data-item-index={itemIndex}
                    id={id}
                    role="option"
                    aria-selected={isSelected}
                    aria-label={getAccessibleLabel()}
                    tabIndex={-1}
                    {...rest}
                >
                    {isExpandedInfoMode ? (
                        <JotItemExpandedContent
                            displayPrimaryText={displayPrimaryText}
                            isPrimaryTextTitle={isPrimaryTextTitle}
                            itemIsDone={item.isDone}
                            itemIcon={itemIcon}
                            itemIndicators={itemIndicators}
                            secondaryTextEl={secondaryTextEl}
                            tagsEl={tagsEl}
                            expandedDatetimeEl={expandedDatetimeEl}
                        />
                    ) : (
                        compactContent
                    )}
                </Tag>
            </ContextMenu.Trigger>
            <JotItemContextMenu item={item} />
        </ContextMenu.Root>
    )
})
