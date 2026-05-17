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
    JOT_ITEM_PRIMARY_TEXT_DISPLAY_LIMIT,
    JOT_ITEM_SECONDARY_TEXT_DISPLAY_LIMIT,
} from "@/config/constants"
import { useLocalUserSettings } from "@/store/localUserSettings"
import { useTransientUiState } from "@/store/transientUiState"
import { useItemActions } from "@/hooks/useItemActions"
import { JotItemIcon } from "./JotItemIcon"
import { JotItemTextContent } from "./JotItemTextContent"
import { JotItemExpandedContent } from "./JotItemExpandedContent"
import JotItemContextMenu from "./JotItemContextMenu"
import type { Item } from "@/types"
import "./JotItem.scss"

function computeItemContent(item: Item): {
    primaryText: string
    secondaryText: string | null
    hasTitle: boolean
} {
    const hasTitle = item.type !== "todo" && !!item.title
    if (hasTitle) {
        return {
            primaryText: truncateText(
                item.title!,
                JOT_ITEM_PRIMARY_TEXT_DISPLAY_LIMIT,
            ),
            secondaryText: truncateText(
                item.content,
                JOT_ITEM_SECONDARY_TEXT_DISPLAY_LIMIT,
            ),
            hasTitle,
        }
    }

    const isTitlelessTextNote = item.type === "text"
    if (isTitlelessTextNote) {
        return {
            primaryText: "",
            secondaryText: truncateText(
                item.content,
                JOT_ITEM_PRIMARY_TEXT_DISPLAY_LIMIT,
            ),
            hasTitle,
        }
    }

    return {
        primaryText: truncateText(
            item.content,
            JOT_ITEM_PRIMARY_TEXT_DISPLAY_LIMIT,
        ),
        secondaryText: null,
        hasTitle,
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
    isExpandedInfoMode: boolean
    id?: string
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
    const { primaryText, secondaryText, hasTitle } = computeItemContent(item)

    const datetime = formatDatetime(item.jottedAt, is24HourClock)
    const detailedDatetime = formatDetailedDatetime(
        item.jottedAt,
        is24HourClock,
    )

    const rootClassName = `JotItem${isSelected ? " JotItem--Selected" : ""}${isExpandedInfoMode ? " JotItem--Expanded" : ""}`

    const itemIndicators = (
        <div className="JotItem__StatusWrapper">
            {item.shouldCopyOnClick && (
                <span
                    className="JotItem__StatusIcon"
                    aria-label="Auto-copy on click"
                >
                    <IconClipboard {...ICON_PROPS_ITEM_STATUS} />
                </span>
            )}
            {item.isPinned && (
                <span
                    className="JotItem__StatusIcon JotItem__StatusIcon--Pin"
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
            primaryText={primaryText}
            secondaryText={secondaryText}
            isCopied={isCopied}
            isDone={item.isDone}
            isPrimaryTextTitle={hasTitle}
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

    const tagsEl = (
        <span className="JotItem__Tags">
            {item.tags.length > 0 ? item.tags.join(" ") : "[untagged]"}
        </span>
    )

    const compactDatetimeEl = (
        <span className="JotItem__Datetime">{datetime}</span>
    )

    const expandedDatetimeEl = (
        <span className="JotItem__Datetime JotItem__Datetime--ExpandedMode">
            {detailedDatetime}
        </span>
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
