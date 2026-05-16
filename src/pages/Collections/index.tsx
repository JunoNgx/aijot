import { useQueryClient } from "@tanstack/react-query"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { IconGripVertical, IconPlus } from "@tabler/icons-react"
import { DateTime } from "luxon"
import { useCollectionsQuery } from "@/hooks/useCollectionsQuery"
import { queryKeys } from "@/db/queryKeys"
import { useCollectionsMutations } from "@/hooks/useCollectionsMutations"
import { useSyncedUserSettings } from "@/store/syncedUserSettings"
import { openCollectionDialog } from "@/utils/openCollectionDialog"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import "./index.scss"
import { ICON_PROPS_BUTTON, ICON_PROPS_NORMAL } from "@/config/constants"
import BackBtn from "@/components/BackBtn"

import type { Collection } from "@/types"
import type { DraggableProvided, DropResult } from "@hello-pangea/dnd"

export default function Collections() {
    useDocumentTitle("Collections")
    const queryClient = useQueryClient()
    const { collectionsQuery } = useCollectionsQuery()
    const { updateCollectionMutation } = useCollectionsMutations()
    const { setAllCollection, setUntaggedCollection, setTrashCollection } =
        useSyncedUserSettings()
    const defaultCollectionSlug = useSyncedUserSettings(
        (s) => s.defaultCollectionSlug,
    )
    const shouldCustomSortCollections = useSyncedUserSettings(
        (s) => s.shouldCustomSortCollections,
    )
    const setShouldCustomSortCollections = useSyncedUserSettings(
        (s) => s.setShouldCustomSortCollections,
    )

    const sortedCollections = collectionsQuery.data ?? []

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

        const coreSetters = {
            all: setAllCollection,
            untagged: setUntaggedCollection,
            trash: setTrashCollection,
        } as const

        if (draggedItem.coreType && draggedItem.coreType in coreSetters) {
            coreSetters[draggedItem.coreType]({
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
                <CollectionSortItem
                    collection={collection}
                    isDefault={collection.slug === defaultCollectionSlug}
                    innerRef={provided.innerRef}
                    draggableProps={provided.draggableProps}
                    dragHandleProps={provided.dragHandleProps}
                    isDragging={snapshot.isDragging}
                />
            )}
        </Draggable>
    ))

    const staticRows = sortedCollections.map((collection) => (
        <CollectionSortItem
            key={collection.id}
            collection={collection}
            isDefault={collection.slug === defaultCollectionSlug}
        />
    ))

    return (
        <div className="Collections">
            <BackBtn />
            <div className="Collections__Header">
                <h1 className="Collections__Title">Collections</h1>
            </div>
            <SortModeToggle
                value={shouldCustomSortCollections}
                onChange={setShouldCustomSortCollections}
            />
            <div className="FlexRow FlexRow--FlexEnd">
                <button
                    className="Collections__BtnNew"
                    onClick={() => openCollectionDialog()}
                >
                    <IconPlus {...ICON_PROPS_BUTTON} />
                    New
                </button>
            </div>
            {shouldCustomSortCollections ? (
                <>
                    <p className="Collections__SortHint">
                        Drag and drop to custom sort the list
                    </p>
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="collections">
                            {(provided) => (
                                <div
                                    className="Collections__List"
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
                <div className="Collections__List">{staticRows}</div>
            )}
        </div>
    )
}

interface CollectionSortItemProps {
    collection: Collection
    isDefault: boolean
    innerRef?: DraggableProvided["innerRef"]
    draggableProps?: DraggableProvided["draggableProps"]
    dragHandleProps?: DraggableProvided["dragHandleProps"]
    isDragging?: boolean
}

function CollectionSortItem({
    collection,
    isDefault,
    innerRef,
    draggableProps,
    dragHandleProps,
    isDragging,
}: CollectionSortItemProps) {
    return (
        <div
            ref={innerRef}
            {...draggableProps}
            className={`CollectionSortItem${isDragging ? " CollectionSortItem--Dragging" : ""}`}
        >
            <button
                className="CollectionSortItem__TriggerBtn"
                onClick={() => openCollectionDialog(collection)}
            >
                <span className="CollectionSortItem__Icon">
                    {collection.icon}
                </span>
                <span className="CollectionSortItem__Name">
                    {collection.name}
                </span>
                {collection.tags.length > 0 && (
                    <span className="CollectionSortItem__Tags">
                        {collection.tags.join(" ")}
                    </span>
                )}
                {collection.coreType && (
                    <span className="CollectionSortItem__CoreBadge">
                        [{collection.coreType}]
                    </span>
                )}
                <span className="CollectionSortItem__Indicators">
                    {isDefault && (
                        <span className="CollectionSortItem__DefaultBadge">
                            [default]
                        </span>
                    )}
                </span>
            </button>
            {dragHandleProps && (
                <span
                    className="CollectionSortItem__DragHandle"
                    {...dragHandleProps}
                >
                    <IconGripVertical {...ICON_PROPS_NORMAL} />
                </span>
            )}
        </div>
    )
}

interface SortModeToggleProps {
    value: boolean
    onChange: (value: boolean) => void
}

function SortModeToggle({ value, onChange }: SortModeToggleProps) {
    return (
        <label className="SortModeToggle">
            Sort mode
            <span className="SortModeToggle__Toggle">
                <label className="SortModeToggle__Option">
                    <input
                        type="radio"
                        name="sortOrder"
                        checked={value}
                        onChange={() => onChange(true)}
                    />
                    Custom
                </label>
                <label className="SortModeToggle__Option">
                    <input
                        type="radio"
                        name="sortOrder"
                        checked={!value}
                        onChange={() => onChange(false)}
                    />
                    A-Z
                </label>
            </span>
        </label>
    )
}
