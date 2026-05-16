import * as ContextMenu from "@radix-ui/react-context-menu"
import {
    IconCopy,
    IconEdit,
    IconTrash,
    IconTrashX,
    IconArrowBackUp,
    IconRefresh,
    IconPin,
    IconPinnedOff,
    IconArrowMoveRight,
    IconCheckbox,
    IconSquare,
} from "@tabler/icons-react"
import { useItemActions } from "@/hooks/useItemActions"
import { ICON_PROPS_NORMAL } from "@/config/constants"
import "./JotItemContextMenu.scss"
import type { Item } from "@/types"

interface Props {
    item: Item
}

export default function JotItemContextMenu({ item }: Props) {
    const {
        copyContent,
        editItem,
        trashItem,
        restoreItem,
        softDeleteItem,
        pinItem,
        unpinItem,
        convertToTodo,
        toggleCopyOnClick,
        refetchLinkMeta,
    } = useItemActions()

    const isInTrash = !!item.trashedAt

    const secondaryItems = (
        <>
            {item.isPinned ? (
                <ContextMenu.Item
                    className="JotItemContextMenu__Item"
                    onClick={() => {
                        unpinItem(item)
                    }}
                >
                    <IconPinnedOff {...ICON_PROPS_NORMAL} />
                    Unpin
                </ContextMenu.Item>
            ) : (
                <ContextMenu.Item
                    className="JotItemContextMenu__Item"
                    onClick={() => {
                        pinItem(item)
                    }}
                >
                    <IconPin {...ICON_PROPS_NORMAL} />
                    Pin
                </ContextMenu.Item>
            )}
            {item.type === "text" && (
                <ContextMenu.Item
                    className="JotItemContextMenu__Item"
                    onClick={() => {
                        convertToTodo(item)
                    }}
                >
                    <IconArrowMoveRight {...ICON_PROPS_NORMAL} />
                    Convert to Todo
                </ContextMenu.Item>
            )}
            <ContextMenu.Item
                className="JotItemContextMenu__Item"
                onClick={() => toggleCopyOnClick(item)}
            >
                {item.shouldCopyOnClick ? (
                    <IconCheckbox {...ICON_PROPS_NORMAL} />
                ) : (
                    <IconSquare {...ICON_PROPS_NORMAL} />
                )}
                Copy on click
            </ContextMenu.Item>
            {item.type === "link" && (
                <ContextMenu.Item
                    className="JotItemContextMenu__Item"
                    onClick={() => {
                        refetchLinkMeta(item)
                    }}
                >
                    <IconRefresh {...ICON_PROPS_NORMAL} />
                    Refetch meta
                </ContextMenu.Item>
            )}
        </>
    )

    const destructiveItems = isInTrash ? (
        <>
            <ContextMenu.Item
                className="JotItemContextMenu__Item"
                onClick={() => {
                    restoreItem(item)
                }}
            >
                <IconArrowBackUp {...ICON_PROPS_NORMAL} />
                Restore
            </ContextMenu.Item>
            <ContextMenu.Item
                className="JotItemContextMenu__Item JotItemContextMenu__Item--Destructive"
                onClick={() => {
                    softDeleteItem(item)
                }}
            >
                <IconTrashX {...ICON_PROPS_NORMAL} />
                Permanently delete
            </ContextMenu.Item>
        </>
    ) : (
        <ContextMenu.Item
            className="JotItemContextMenu__Item JotItemContextMenu__Item--Destructive"
            onClick={() => {
                trashItem(item)
            }}
        >
            <IconTrash {...ICON_PROPS_NORMAL} />
            Trash
        </ContextMenu.Item>
    )

    return (
        <ContextMenu.Portal>
            <ContextMenu.Content className="JotItemContextMenu">
                <ContextMenu.Item
                    className="JotItemContextMenu__Item"
                    onClick={() => {
                        copyContent(item)
                    }}
                >
                    <IconCopy {...ICON_PROPS_NORMAL} />
                    Copy
                </ContextMenu.Item>
                <ContextMenu.Item
                    className="JotItemContextMenu__Item"
                    onClick={() => {
                        editItem(item)
                    }}
                >
                    <IconEdit {...ICON_PROPS_NORMAL} />
                    Edit
                </ContextMenu.Item>
                <ContextMenu.Separator className="JotItemContextMenu__Separator" />
                {secondaryItems}
                <ContextMenu.Separator className="JotItemContextMenu__Separator" />
                {destructiveItems}
            </ContextMenu.Content>
        </ContextMenu.Portal>
    )
}
