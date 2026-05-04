import { useQueryClient } from "@tanstack/react-query"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { IconGripVertical, IconPlus } from "@tabler/icons-react"
import { DateTime } from "luxon"
import { useCollectionsQuery, queryKeys } from "@/hooks/useCollectionsQuery"
import { useCollectionsMutations } from "@/hooks/useCollectionsMutations"
import { useCoreCollectionSettings } from "@/store/coreCollectionSettings"
import { useSyncedUserSettings } from "@/store/syncedUserSettings"
import { openCollectionDialog } from "@/utils/openCollectionDialog"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import styles from "./index.module.scss"
import { ICON_PROPS_BUTTON, ICON_PROPS_NORMAL } from "@/config/constants"
import BackBtn from "@/components/BackBtn"

import type { Collection } from "@/types"
import type { DropResult } from "@hello-pangea/dnd"

export default function Collections() {
    useDocumentTitle("Collections")
    const queryClient = useQueryClient()
    const { collectionsQuery } = useCollectionsQuery()
    const { updateCollectionMutation } = useCollectionsMutations()
    const { setAll, setUntagged, setTrash, all, untagged, trash } =
        useCoreCollectionSettings()
    const defaultCollectionSlug = useSyncedUserSettings(
        (s) => s.defaultCollectionSlug,
    )
    const shouldCustomSortCollections = useSyncedUserSettings(
        (s) => s.shouldCustomSortCollections,
    )
    const setShouldCustomSortCollections = useSyncedUserSettings(
        (s) => s.setShouldCustomSortCollections,
    )

    const sortedCollections = (collectionsQuery.data ?? []).map((c) => {
        if (c.coreType === "all") return { ...c, sortOrder: all.sortOrder }
        if (c.coreType === "untagged")
            return { ...c, sortOrder: untagged.sortOrder }
        if (c.coreType === "trash") return { ...c, sortOrder: trash.sortOrder }
        return c
    })

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return
        if (result.source.index === result.destination.index) return

        const reorderedItems = [...sortedCollections]
        const [draggedItem] = reorderedItems.splice(result.source.index, 1)
        reorderedItems.splice(result.destination.index, 0, draggedItem)

        const itemBefore = reorderedItems[result.destination.index - 1]
        const itemAfter = reorderedItems[result.destination.index + 1]

        let newSortOrder: number
        if (!itemBefore) newSortOrder = (itemAfter?.sortOrder ?? 0) - 1000
        else if (!itemAfter) newSortOrder = itemBefore.sortOrder + 1000
        else newSortOrder = (itemBefore.sortOrder + itemAfter.sortOrder) / 2

        if (draggedItem.coreType === "all") {
            setAll({
                sortOrder: newSortOrder,
                updatedAt: DateTime.now().toISO(),
            })
            queryClient.invalidateQueries({ queryKey: queryKeys.collections })
            return
        }
        if (draggedItem.coreType === "untagged") {
            setUntagged({
                sortOrder: newSortOrder,
                updatedAt: DateTime.now().toISO(),
            })
            queryClient.invalidateQueries({ queryKey: queryKeys.collections })
            return
        }
        if (draggedItem.coreType === "trash") {
            setTrash({
                sortOrder: newSortOrder,
                updatedAt: DateTime.now().toISO(),
            })
            queryClient.invalidateQueries({ queryKey: queryKeys.collections })
            return
        }

        updateCollectionMutation.mutate({
            ...draggedItem,
            sortOrder: newSortOrder,
            updatedAt: DateTime.now().toISO(),
        })
    }

    const draggableRows = sortedCollections.map((collection, index) => (
        <Draggable
            key={collection.id}
            draggableId={collection.id}
            index={index}
        >
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={[
                        styles.CollectionItem,
                        snapshot.isDragging
                            ? styles["CollectionItem--Dragging"]
                            : "",
                    ].join(" ")}
                >
                    <button
                        className={styles.CollectionItem__TriggerBtn}
                        onClick={() => openCollectionDialog(collection)}
                    >
                        <CollectionRow
                            collection={collection}
                            isDefault={
                                collection.slug === defaultCollectionSlug
                            }
                        />
                    </button>
                    <span
                        className={styles.CollectionItem__DragHandle}
                        {...provided.dragHandleProps}
                    >
                        <IconGripVertical {...ICON_PROPS_NORMAL} />
                    </span>
                </div>
            )}
        </Draggable>
    ))

    const staticRows = sortedCollections.map((collection) => (
        <div key={collection.id} className={styles.CollectionItem}>
            <button
                className={styles.CollectionItem__TriggerBtn}
                onClick={() => openCollectionDialog(collection)}
            >
                <CollectionRow
                    collection={collection}
                    isDefault={collection.slug === defaultCollectionSlug}
                />
            </button>
        </div>
    ))

    return (
        <div className={styles.Collections}>
            <BackBtn />
            <div className={styles.Collections__Header}>
                <h1 className={styles.Collections__Title}>Collections</h1>
            </div>
            <label className={styles.Collections__SortLabel}>
                Sort mode
                <span className={styles.Collections__SortToggle}>
                    <label className={styles.Collections__SortOption}>
                        <input
                            type="radio"
                            name="sortOrder"
                            checked={shouldCustomSortCollections}
                            onChange={() =>
                                setShouldCustomSortCollections(true)
                            }
                        />
                        Custom
                    </label>
                    <label className={styles.Collections__SortOption}>
                        <input
                            type="radio"
                            name="sortOrder"
                            checked={!shouldCustomSortCollections}
                            onChange={() =>
                                setShouldCustomSortCollections(false)
                            }
                        />
                        A-Z
                    </label>
                </span>
            </label>
            <div className="FlexRow FlexRow--FlexEnd">
                <button
                    className={styles.Collections__BtnNew}
                    onClick={() => openCollectionDialog()}
                >
                    <IconPlus {...ICON_PROPS_BUTTON} />
                    New
                </button>
            </div>
            {shouldCustomSortCollections ? (
                <>
                    <p className={styles.Collections__SortHint}>
                        Drag and drop to custom sort the list
                    </p>
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="collections">
                            {(provided) => (
                                <div
                                    className={styles.Collections__List}
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                >
                                    {draggableRows}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </>
            ) : (
                <div className={styles.Collections__List}>{staticRows}</div>
            )}
        </div>
    )
}

interface CollectionRowProps {
    collection: Collection
    isDefault: boolean
}

function CollectionRow({ collection, isDefault }: CollectionRowProps) {
    return (
        <>
            <span className={styles.CollectionItem__Icon}>
                {collection.icon}
            </span>
            <span className={styles.CollectionItem__Name}>
                {collection.name}
            </span>
            {collection.tags.length > 0 && (
                <span className={styles.CollectionItem__Tags}>
                    {collection.tags.join(" ")}
                </span>
            )}
            {collection.coreType && (
                <span className={styles.CollectionItem__CoreBadge}>
                    [{collection.coreType}]
                </span>
            )}
            <span className={styles.CollectionItem__Indicators}>
                {isDefault && (
                    <span className={styles.CollectionItem__DefaultBadge}>
                        [default]
                    </span>
                )}
            </span>
        </>
    )
}
