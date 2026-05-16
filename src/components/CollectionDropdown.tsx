import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { useHotkeys } from "react-hotkeys-hook"
import {
    IconCheck,
    IconChevronDown,
    IconPencil,
    IconPlus,
} from "@tabler/icons-react"
import { useDropdownFocusCleanup } from "@/hooks/useDropdownFocusCleanup"
import { useCollectionsQuery } from "@/hooks/useCollectionsQuery"
import { useNavigateRoutes } from "@/hooks/useNavigateRoutes"
import { useCurrentCollection } from "@/hooks/useCurrentCollection"
import { openCollectionDialog } from "@/utils/openCollectionDialog"
import {
    COLLECTION_HOTKEY_COUNT,
    DROPDOWN_OFFSET,
    ICON_PROPS_CURR_COLLECTION,
    ICON_PROPS_ITEM_DROPDOWN,
} from "@/config/constants"
import styles from "./CollectionDropdown.module.scss"

const HOTKEYS = Array.from(
    { length: COLLECTION_HOTKEY_COUNT },
    (_, i) => `mod+${i + 1}`,
)

export default function CollectionDropdown() {
    const { triggerPointerDown, triggerKeyDown, contentCloseAutoFocus } =
        useDropdownFocusCleanup()
    const { collectionsQuery } = useCollectionsQuery()
    const { navigateToCollection } = useNavigateRoutes()
    const { currCollection, currSlug } = useCurrentCollection()

    const collections = collectionsQuery.data ?? []
    const hotkeyed = collections.slice(0, COLLECTION_HOTKEY_COUNT)

    useHotkeys(HOTKEYS, (e) => {
        const index = parseInt(e.key) - 1
        const target = hotkeyed[index]
        if (target) navigateToCollection(target.slug)
    })

    const trigger = currCollection ? (
        <>
            <span>{currCollection.icon}</span>
            <span className={styles.CollectionDropdown__TriggerLabel}>
                {currCollection.name}
            </span>
        </>
    ) : null

    const menuItems = collections.map((collection, index) => {
        const hotkeyNum = index < COLLECTION_HOTKEY_COUNT ? index + 1 : null
        const isActive = collection.slug === currSlug

        const itemClassName = [
            styles.CollectionItem,
            styles["CollectionItem--Collection"],
            isActive ? styles["CollectionItem--Active"] : "",
        ].join(" ")

        const currCollectionCheckmark = (
            <IconCheck {...ICON_PROPS_CURR_COLLECTION} />
        )
        const hotkeyNumberUi = hotkeyNum !== null && (
            <kbd className={styles.CollectionItem__RightContent}>
                {hotkeyNum}
            </kbd>
        )
        const rightContent = (
            <span className={styles.CollectionItem__RightContent}>
                {isActive ? currCollectionCheckmark : hotkeyNumberUi}
            </span>
        )

        return (
            <div key={collection.id}>
                <DropdownMenu.Item
                    className={itemClassName}
                    onSelect={() => navigateToCollection(collection.slug)}
                >
                    <span>{collection.icon}</span>
                    <span className={styles.CollectionItem__Label}>
                        {collection.name}
                    </span>
                    {rightContent}
                </DropdownMenu.Item>
            </div>
        )
    })

    return (
        <div className={styles.CollectionDropdown}>
            <DropdownMenu.Root>
                <DropdownMenu.Trigger
                    className={styles.CollectionDropdown__Trigger}
                    onPointerDown={triggerPointerDown}
                    onKeyDown={triggerKeyDown}
                >
                    {trigger}
                    <IconChevronDown
                        {...ICON_PROPS_ITEM_DROPDOWN}
                        className={styles.CollectionDropdown__TriggerChevron}
                    />
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                    <DropdownMenu.Content
                        className={styles.CollectionDropdown__Content}
                        align="start"
                        sideOffset={DROPDOWN_OFFSET}
                        onCloseAutoFocus={contentCloseAutoFocus}
                    >
                        {menuItems}
                        <DropdownMenu.Separator
                            className={styles.CollectionDropdown__Separator}
                        />
                        {currCollection && (
                            <DropdownMenu.Item
                                className={`${styles.CollectionItem} ${styles["CollectionItem--Action"]}`}
                                onSelect={() =>
                                    openCollectionDialog(currCollection)
                                }
                            >
                                <IconPencil {...ICON_PROPS_ITEM_DROPDOWN} />
                                <span className={styles.CollectionItem__Label}>
                                    Edit this collection
                                </span>
                            </DropdownMenu.Item>
                        )}
                        <DropdownMenu.Item
                            className={`${styles.CollectionItem} ${styles["CollectionItem--Action"]}`}
                            onSelect={() => openCollectionDialog()}
                        >
                            <IconPlus {...ICON_PROPS_ITEM_DROPDOWN} />
                            <span className={styles.CollectionItem__Label}>
                                New collection
                            </span>
                        </DropdownMenu.Item>
                    </DropdownMenu.Content>
                </DropdownMenu.Portal>
            </DropdownMenu.Root>
        </div>
    )
}
