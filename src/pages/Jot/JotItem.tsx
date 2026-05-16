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

function getAccessibleLabel(item: Item) {
    const isPrimaryTextTitle = item.type !== "todo" && item.title !== undefined
    const typeLabel =
        item.type === "todo"
            ? item.isDone
                ? "Completed todo"
                : "Todo"
            : item.type === "link"
              ? "Link"
              : "Text"

    return [
        typeLabel,
        truncateText(isPrimaryTextTitle ? item.title! : item.content, 100),
    ]
        .filter(Boolean)
        .join(": ")
}

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
    mainContentEl: ReactNode
    itemIcon: ReactNode
    itemIndicators: ReactNode
    tagsEl: ReactNode
    expandedDatetimeEl: ReactNode
}

function JotItemTextContent({
    primaryTextEl,
    secondaryTextEl,
    isCopied,
}: {
    primaryTextEl: ReactNode
    secondaryTextEl: ReactNode
    isCopied: boolean
}) {
    const copiedContent = (
        <span
            className={`
                ${styles.JotItemTextContent__PrimaryText}
                ${styles.JotItemTextContent__CopiedText}
            `}
        >
            Copied
        </span>
    )

    const regularContent = (
        <>
            {primaryTextEl}
            {secondaryTextEl}
        </>
    )

    return (
        <div
            className={styles.JotItemTextContent}
            key={isCopied ? "copied" : "normal"}
        >
            {isCopied ? copiedContent : regularContent}
        </div>
    )
}

function JotItemExpandedContent({
    mainContentEl,
    itemIcon,
    itemIndicators,
    tagsEl,
    expandedDatetimeEl,
}: JotItemExpandedContentProps) {
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
    const primaryText = truncateText(
        isPrimaryTextTitle ? item.title! : item.content,
        JOT_ITEM_PRIMARY_TEXT_DISPLAY_LIMIT,
    )
    const secondaryText = isPrimaryTextTitle
        ? truncateText(item.content, JOT_ITEM_SECONDARY_TEXT_DISPLAY_LIMIT)
        : null
    const datetime = formatDatetime(item.jottedAt, is24HourClock)
    const detailedDatetime = formatDetailedDatetime(
        item.jottedAt,
        is24HourClock,
    )

    const secondaryTextEl = secondaryText && (
        <span className={styles.JotItemTextContent__SecondaryText}>
            {secondaryText}
        </span>
    )

    const primaryTextEl = (
        <span
            className={`
                ${styles.JotItemTextContent__PrimaryText}
                ${item.isDone ? styles["JotItemTextContent__PrimaryText--TodoDone"] : ""}
                ${isPrimaryTextTitle ? styles["JotItemTextContent__PrimaryText--Title"] : ""}
            `}
        >
            {primaryText}
        </span>
    )

    const rootClassName = `
        ${styles.JotItem}
        ${isSelected ? styles["JotItem--Selected"] : ""}
        ${isExpandedInfoMode ? styles["JotItem--Expanded"] : ""}
    `

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

    const textContentEl = (
        <JotItemTextContent
            primaryTextEl={primaryTextEl}
            secondaryTextEl={secondaryTextEl}
            isCopied={isCopied}
        />
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
            {textContentEl}
            {itemIndicators}
            {compactDatetimeEl}
        </>
    )

    const handleClick = (e: MouseEvent) => {
        triggerPrimaryAction(item, e)
    }

    const wrapperProps =
        item.type === "link"
            ? {
                  as: "a" as const,
                  href: item.content,
                  target: "_blank",
                  rel: "noopener noreferrer",
              }
            : { as: "button" as const }
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
                    aria-label={getAccessibleLabel(item)}
                    tabIndex={-1}
                    onClick={handleClick}
                    {...rest}
                >
                    {isExpandedInfoMode ? (
                        <JotItemExpandedContent
                            mainContentEl={textContentEl}
                            itemIcon={itemIcon}
                            itemIndicators={itemIndicators}
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
