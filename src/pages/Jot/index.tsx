import {
    useState,
    useEffect,
    useLayoutEffect,
    useRef,
    useMemo,
    useCallback,
} from "react"
import { useParams, Navigate } from "react-router-dom"
import { useHotkeys } from "react-hotkeys-hook"
import { useItemsQuery } from "@/hooks/useItemsQuery"
import { useCollectionsQuery } from "@/hooks/useCollectionsQuery"
import { useLocalAppData } from "@/store/localAppData"
import { useTransientUiState } from "@/store/transientUiState"
import { useNavigateRoutes } from "@/hooks/useNavigateRoutes"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import { useSyncedUserSettings } from "@/store/syncedUserSettings"
import {
    SHORTCUT_FOCUS_MAIN_INPUT,
    SHORTCUT_TOGGLE_ITEM_EXPANDED_MODE,
    SHORTCUT_NAV_PREV_COLLECTION,
    SHORTCUT_NAV_NEXT_COLLECTION,
    SHORTCUT_MASS_TAG_EDIT,
    ROUTE_JOT,
} from "@/config/constants"
import { useItemsMutations } from "@/hooks/useItemsMutations"
import { openMassTagEditDialog } from "@/utils/openMassTagEditDialog"
import MainInput from "@/pages/Jot/MainInput"
import CollectionNotice from "@/pages/Jot/CollectionNotice"
import JotItem from "@/pages/Jot/JotItem"
import "./index.scss"
import type { Collection, MainInputSearchData, Item } from "@/types"

const DEFAULT_SEARCH_DATA: MainInputSearchData = {
    tags: [],
}

function filterByCollection(items: Item[], collection: Collection): Item[] {
    if (collection.coreType === "all") return items
    if (collection.coreType === "trash") {
        // Trash has its own query - baseItems uses trashedItemsQuery when trash
        return items
    }
    if (collection.coreType === "untagged") {
        return items.filter((item) => item.tags.length === 0)
    }
    return items.filter(
        (item) =>
            collection.types.includes(item.type) &&
            collection.tags.every((tag) => item.tags.includes(tag)),
    )
}

function doesItemMatchAllSearchTags(item: Item, searchTags: string[]): boolean {
    return searchTags.every((searchTag) =>
        item.tags.some((itemTag) => itemTag.includes(searchTag)),
    )
}

function filterItems(items: Item[], searchData: MainInputSearchData): Item[] {
    let result = items

    if (searchData.filterType === "incompleteTodo") {
        result = result.filter((item) => item.type === "todo" && !item.isDone)
    } else if (searchData.filterType === "completedTodo") {
        result = result.filter((item) => item.type === "todo" && item.isDone)
    } else if (searchData.filterType) {
        result = result.filter((item) => item.type === searchData.filterType)
    }

    if (searchData.tags.length > 0) {
        result = result.filter((item) =>
            doesItemMatchAllSearchTags(item, searchData.tags),
        )
    }

    if (searchData.searchText) {
        const lowerSearch = searchData.searchText.toLowerCase()
        result = result.filter(
            (item) =>
                item.content.toLowerCase().includes(lowerSearch) ||
                item.title?.toLowerCase().includes(lowerSearch),
        )
    }

    return result
}

export default function Jot() {
    const { slug } = useParams<{ slug: string }>()
    const { collectionsQuery } = useCollectionsQuery()
    const [searchData, setSearchData] =
        useState<MainInputSearchData>(DEFAULT_SEARCH_DATA)
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const { itemsQuery, trashedItemsQuery } = useItemsQuery()
    const { massTagEditMutation } = useItemsMutations()
    const { shouldShowDemoDataBanner } = useLocalAppData()
    const mainInputRef = useRef<HTMLInputElement>(null)

    const defaultShouldShowJotItemExtraInfo = useSyncedUserSettings(
        (s) => s.shouldShowJotItemExtraInfo,
    )
    const isShowingJotItemExtraInfo = useTransientUiState(
        (s) => s.isShowingJotItemExtraInfo,
    )
    const setIsShowingJotItemExtraInfo = useTransientUiState(
        (s) => s.setIsShowingJotItemExtraInfo,
    )

    useLayoutEffect(() => {
        setIsShowingJotItemExtraInfo(defaultShouldShowJotItemExtraInfo)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const collections = collectionsQuery.data ?? []
    const currCollection = collections.find((c) => c.slug === slug)
    const allSlug = useSyncedUserSettings((s) => s.allCollection.slug)

    useDocumentTitle(currCollection?.name)

    const isTrash = currCollection?.coreType === "trash"
    const collectionItems = useMemo(() => {
        const items = isTrash
            ? (trashedItemsQuery.data ?? [])
            : (itemsQuery.data ?? [])
        return currCollection
            ? filterByCollection(items, currCollection)
            : items
    }, [isTrash, trashedItemsQuery.data, itemsQuery.data, currCollection])
    const visibleItems = useMemo(
        () => filterItems(collectionItems, searchData),
        [collectionItems, searchData],
    )

    useEffect(() => {
        useTransientUiState.getState().setMainListVisibleItems(visibleItems)
    }, [visibleItems])
    const selectedItem =
        selectedIndex >= 0 ? visibleItems[selectedIndex] : undefined

    const handleOpenMassTagEditDialog = useCallback(() => {
        openMassTagEditDialog({
            items: visibleItems,
            onSave: (tagStr, mode) => {
                massTagEditMutation.mutate({
                    items: visibleItems,
                    tagStr,
                    mode,
                })
            },
        })
    }, [visibleItems, massTagEditMutation])

    useEffect(() => {
        if (selectedIndex <= 0) {
            window.scrollTo({ top: 0, behavior: "smooth" })
            return
        }
        document
            .querySelector(`[data-item-index="${selectedIndex}"]`)
            ?.scrollIntoView({ block: "nearest" })
    }, [selectedIndex])

    useHotkeys(SHORTCUT_FOCUS_MAIN_INPUT, () => mainInputRef.current?.focus(), {
        enableOnFormTags: true,
        preventDefault: true,
    })

    useHotkeys(
        SHORTCUT_TOGGLE_ITEM_EXPANDED_MODE,
        () => {
            setIsShowingJotItemExtraInfo(
                !useTransientUiState.getState().isShowingJotItemExtraInfo,
            )
        },
        { enableOnFormTags: true },
    )

    useHotkeys(SHORTCUT_MASS_TAG_EDIT, handleOpenMassTagEditDialog, {
        enableOnFormTags: true,
    })

    const { navigateToCollection } = useNavigateRoutes()
    const collectionIndex = collections.findIndex((c) => c.slug === slug)
    const prevCollectionSlug =
        collections[
            collectionIndex <= 0 ? collections.length - 1 : collectionIndex - 1
        ]?.slug
    const nextCollectionSlug =
        collections[
            collectionIndex >= collections.length - 1 ? 0 : collectionIndex + 1
        ]?.slug

    const navigateToPrevCollection = useCallback(() => {
        if (prevCollectionSlug) {
            navigateToCollection(prevCollectionSlug)
        }
    }, [prevCollectionSlug, navigateToCollection])

    const navigateToNextCollection = useCallback(() => {
        if (nextCollectionSlug) {
            navigateToCollection(nextCollectionSlug)
        }
    }, [nextCollectionSlug, navigateToCollection])

    useHotkeys(SHORTCUT_NAV_PREV_COLLECTION, navigateToPrevCollection, {}, [
        navigateToPrevCollection,
    ])
    useHotkeys(SHORTCUT_NAV_NEXT_COLLECTION, navigateToNextCollection, {}, [
        navigateToNextCollection,
    ])

    if (!collectionsQuery.isPending && !currCollection) {
        return <Navigate to={`${ROUTE_JOT}/${allSlug}`} replace />
    }

    const listboxId = "jot-items-listbox"
    const activeDescendantId =
        selectedIndex >= 0 ? `jot-item-${selectedIndex}` : undefined
    const itemList = visibleItems.map((item, index) => (
        <JotItem
            key={item.id}
            id={`jot-item-${index}`}
            item={item}
            isSelected={index === selectedIndex}
            itemIndex={index}
            isExpandedInfoMode={isShowingJotItemExtraInfo}
        />
    ))

    return (
        <div className="Jot">
            <CollectionNotice
                shouldShowDemoDataBanner={shouldShowDemoDataBanner}
                isTrash={isTrash}
                collection={currCollection}
            />
            <MainInput
                inputRef={mainInputRef}
                onParse={setSearchData}
                selectedIndex={selectedIndex}
                selectedItem={selectedItem}
                visibleItemCount={visibleItems.length}
                onSelectedIndexChange={setSelectedIndex}
                isTrash={isTrash}
                currCollectionTags={currCollection?.tags ?? []}
                listboxId={listboxId}
                activeDescendantId={activeDescendantId}
                onBlur={() => setSelectedIndex(-1)}
            />
            <div
                id={listboxId}
                className={`Jot__List${isShowingJotItemExtraInfo ? " Jot__List--Expanded" : ""}`}
                role="listbox"
                aria-orientation="vertical"
            >
                {itemList}
            </div>
        </div>
    )
}
