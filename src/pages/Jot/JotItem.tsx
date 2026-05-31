import { type MouseEvent, memo } from "react"
import * as ContextMenu from "@radix-ui/react-context-menu"
import { IconClipboard, IconPinFilled } from "@tabler/icons-react"
import {
    formatDatetime,
    formatDetailedDatetime,
    truncateText,
} from "@/utils/helpers"
import {
    ICON_PROPS_ITEM_STATUS,
    JOT_ITEM_COMPACT_TEXT_DISPLAY_LIMIT,
    REDACTED_PLACEHOLDER,
} from "@/config/constants"
import { useLocalUserSettings } from "@/store/localUserSettings"
import { useTransientUiState } from "@/store/transientUiState"
import { useItemActions } from "@/hooks/useItemActions"
import { JotItemIcon } from "./JotItemIcon"
import { JotItemCompactBody } from "./JotItemCompactBody"
import { JotItemExpandedLayout } from "./JotItemExpandedLayout"
import JotItemContextMenu from "./JotItemContextMenu"
import type { Item } from "@/types"
import "./JotItem.scss"

function computeItemContent(item: Item): {
    primaryText: string
    secondaryText: string | null
} {
    if (item.type === "todo") {
        return {
            primaryText: truncateText(
                item.content,
                JOT_ITEM_COMPACT_TEXT_DISPLAY_LIMIT,
            ),
            secondaryText: null,
        }
    }

    const primaryText = truncateText(
        item.title,
        JOT_ITEM_COMPACT_TEXT_DISPLAY_LIMIT,
    )
    const secondaryText = truncateText(
        item.content,
        JOT_ITEM_COMPACT_TEXT_DISPLAY_LIMIT,
    )

    return {
        primaryText,
        secondaryText: item.isRedacted ? REDACTED_PLACEHOLDER : secondaryText,
    }
}

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
    isExpandedMode: boolean
    id?: string
}

export default memo(function JotItem({
    item,
    isSelected,
    itemIndex,
    isExpandedMode,
    id,
}: Props) {
    const { triggerPrimaryAction } = useItemActions()
    const is24HourClock = useLocalUserSettings((s) => s.is24HourClock)
    const copiedItemIds = useTransientUiState((s) => s.copiedItemIds)
    const fetchingLinkMetaItemIds = useTransientUiState(
        (s) => s.fetchingLinkMetaItemIds,
    )
    const { primaryText, secondaryText } = computeItemContent(item)

    const datetime = formatDatetime(item.jottedAt, is24HourClock)
    const detailedDatetime = formatDetailedDatetime(
        item.jottedAt,
        is24HourClock,
    )

    const rootClassName = `JotItem${isSelected ? " JotItem--Selected" : ""}${isExpandedMode ? " JotItem--Expanded" : ""}`

    const hasStatusIndicator = item.shouldCopyOnClick || item.isPinned
    const itemStatusIndicators = hasStatusIndicator && (
        <div className="JotItem__StatusWrapper">
            {item.shouldCopyOnClick && (
                <span
                    className="JotItem__StatusIcon"
                    aria-label="Item is set to copy content on click"
                    title="Item is set to copy content on click"
                >
                    <IconClipboard {...ICON_PROPS_ITEM_STATUS} />
                </span>
            )}
            {item.isPinned && (
                <span
                    className="JotItem__StatusIcon"
                    aria-label="Item is pinned"
                    title="Item is pinned"
                >
                    <IconPinFilled {...ICON_PROPS_ITEM_STATUS} />
                </span>
            )}
        </div>
    )

    const isCopied = copiedItemIds.includes(item.id)

    const textContentEl = (
        <JotItemCompactBody
            primaryText={primaryText}
            secondaryText={secondaryText}
            isCopied={isCopied}
            isDone={item.isDone}
        />
    )

    const itemIcon = (
        <span className="JotItem__Icon">
            <JotItemIcon
                item={item}
                fetchingItemIds={fetchingLinkMetaItemIds}
            />
        </span>
    )

    const compactDatetimeEl = (
        <span className="JotItem__Datetime" title={detailedDatetime}>
            {datetime}
        </span>
    )

    const compactContent = (
        <>
            {itemIcon}
            {textContentEl}
            {itemStatusIndicators}
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
                    {isExpandedMode ? (
                        <JotItemExpandedLayout
                            item={item}
                            isCopied={isCopied}
                            itemIcon={itemIcon}
                            itemStatusIndicators={itemStatusIndicators}
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
