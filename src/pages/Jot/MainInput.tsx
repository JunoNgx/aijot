import { useState, useEffect } from "react"
import { getHotkeyHandler } from "@/utils/hotkeyHandler"
import { useItemActions } from "@/hooks/useItemActions"
import { useMainInputParser } from "@/hooks/useMainInputParser"
import MainInputExtendedMenu from "./MainInputExtendedMenu"
import {
    SHORTCUT_NAV_UP,
    SHORTCUT_NAV_DOWN,
    SHORTCUT_NAV_UP_SKIP,
    SHORTCUT_NAV_DOWN_SKIP,
    SHORTCUT_NAV_TOP,
    SHORTCUT_NAV_BOTTOM,
    SHORTCUT_NAV_ACTION,
    SHORTCUT_ITEM_EDIT,
    SHORTCUT_ITEM_COPY,
    SHORTCUT_ITEM_TRASH,
    SHORTCUT_ITEM_RESTORE,
    SHORTCUT_ITEM_TOGGLE_COPY_ON_CLICK,
    SHORTCUT_ITEM_REFETCH,
    SHORTCUT_ITEM_CONVERT_TO_TODO,
} from "@/config/constants"
import styles from "./MainInput.module.scss"
import type { MainInputSearchData, Item } from "@/types"

interface Props {
    inputRef: React.RefObject<HTMLInputElement | null>
    onParse: (searchData: MainInputSearchData) => void
    selectedIndex: number
    selectedItem: Item | undefined
    visibleItemCount: number
    onSelectedIndexChange: (index: number) => void
    isTrash: boolean
    currCollectionTags: string[]
    listboxId?: string
    activeDescendantId?: string
}

export default function MainInput({
    inputRef,
    onParse,
    selectedIndex,
    selectedItem,
    visibleItemCount,
    onSelectedIndexChange,
    isTrash,
    currCollectionTags,
    listboxId,
    activeDescendantId,
}: Props) {
    const [inputValue, setInputValue] = useState("")
    const {
        createItem,
        copyContent,
        editItem,
        trashItem,
        restoreItem,
        toggleCopyOnClick,
        refetchLinkMeta,
        convertToTodo,
    } = useItemActions()
    const searchData = useMainInputParser(inputValue)

    useEffect(() => {
        onParse(searchData)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchData])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value)
        onSelectedIndexChange(-1)
    }

    const handleSubmit = () => {
        if (!inputValue.trim()) return
        if (searchData.filterType !== undefined || searchData.tags.length > 0)
            return
        createItem(inputValue, currCollectionTags)
        setInputValue("")
    }

    const handlePrimaryAction = () => {
        if (selectedIndex < 0) return
        document
            .querySelector<HTMLElement>(`[data-item-index="${selectedIndex}"]`)
            ?.click()
    }

    const moveSelection = (delta: number) => {
        if (visibleItemCount === 0) return
        const targetIndex = selectedIndex + delta
        const clampedIndex = Math.max(
            -1,
            Math.min(targetIndex, visibleItemCount - 1),
        )
        onSelectedIndexChange(clampedIndex)
    }

    const jumpToTop = () => {
        if (visibleItemCount === 0) return
        onSelectedIndexChange(0)
    }

    const jumpToBottom = () => {
        if (visibleItemCount === 0) return
        onSelectedIndexChange(visibleItemCount - 1)
    }

    const handleEscapePress = () => {
        onSelectedIndexChange(-1)
        inputRef.current?.blur()
    }

    const hotkeyHandler = getHotkeyHandler([
        ["Enter", handleSubmit],
        [SHORTCUT_NAV_ACTION, handlePrimaryAction],
        [SHORTCUT_NAV_DOWN, () => moveSelection(1)],
        [SHORTCUT_NAV_UP, () => moveSelection(-1)],
        [SHORTCUT_NAV_DOWN_SKIP, () => moveSelection(5)],
        [SHORTCUT_NAV_UP_SKIP, () => moveSelection(-5)],
        [SHORTCUT_NAV_TOP, jumpToTop],
        [SHORTCUT_NAV_BOTTOM, jumpToBottom],
        ["Escape", handleEscapePress],
        [
            SHORTCUT_ITEM_COPY,
            () => {
                if (selectedItem) copyContent(selectedItem)
            },
        ],
        [
            SHORTCUT_ITEM_EDIT,
            () => {
                if (selectedItem) editItem(selectedItem)
            },
        ],
        [
            SHORTCUT_ITEM_TRASH,
            () => {
                if (selectedItem) trashItem(selectedItem)
            },
        ],
        [
            SHORTCUT_ITEM_RESTORE,
            () => {
                if (selectedItem && isTrash) restoreItem(selectedItem)
            },
        ],
        [
            SHORTCUT_ITEM_TOGGLE_COPY_ON_CLICK,
            () => {
                if (selectedItem) toggleCopyOnClick(selectedItem)
            },
        ],
        [
            SHORTCUT_ITEM_REFETCH,
            () => {
                if (selectedItem && selectedItem.type === "link")
                    refetchLinkMeta(selectedItem)
            },
        ],
        [
            SHORTCUT_ITEM_CONVERT_TO_TODO,
            () => {
                if (selectedItem && selectedItem.type === "text")
                    convertToTodo(selectedItem)
            },
        ],
    ])

    return (
        <div className={styles.MainInput}>
            <input
                ref={inputRef}
                className={styles.MainInput__Input}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={hotkeyHandler}
                role="combobox"
                aria-controls={listboxId}
                aria-expanded={visibleItemCount > 0}
                aria-activedescendant={activeDescendantId}
                aria-autocomplete="list"
            />
            <MainInputExtendedMenu
                inputValue={inputValue}
                setInputValue={setInputValue}
                inputRef={inputRef}
                onSubmit={handleSubmit}
            />
        </div>
    )
}
