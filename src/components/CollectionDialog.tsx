import { useState, useRef, useEffect } from "react"
import { useHotkeys } from "react-hotkeys-hook"
import { DateTime } from "luxon"
import { nanoid } from "nanoid"
import { EmojiPicker } from "frimousse"
import { IconX } from "@tabler/icons-react"
import { useCollectionsQuery } from "@/hooks/useCollectionsQuery"
import { useCollectionsMutations } from "@/hooks/useCollectionsMutations"
import { useDialogStore } from "@/store/dialogStore"
import { useSyncedUserSettings } from "@/store/syncedUserSettings"
import { generateSlug } from "@/utils/helpers"
import styles from "./CollectionDialog.module.scss"
import type { Collection, ItemType } from "@/types"
import { ICON_PROPS_ACTION, SHORTCUT_SAVE_AND_CLOSE } from "@/config/constants"

const RANDOM_ICONS = [
    "💼", // work
    "🏠", // home
    "📚", // reading / learning
    "🎯", // goals
    "💡", // ideas
    "✈️", // travel
    "🍽️", // food / recipes
    "💰", // finance
    "🎵", // music
    "🎬", // films / media
    "🏋️", // fitness
    "🌱", // projects / growth
    "💻", // tech / coding
    "🎮", // gaming
    "🛒", // shopping
    "❤️", // personal / favourites
    "📸", // photos
    "🎓", // education
    "🔬", // research
    "🎁", // gifts / wishlist
]
const getRandomIcon = () =>
    RANDOM_ICONS[Math.floor(Math.random() * RANDOM_ICONS.length)]

const ALL_TYPES: ItemType[] = ["text", "todo", "link"]
const TYPE_LABELS: Record<ItemType, string> = {
    text: "Text",
    todo: "Todo",
    link: "Link",
}

interface Props {
    collection?: Collection
}

export default function CollectionDialog({ collection }: Props) {
    const { collectionsQuery } = useCollectionsQuery()
    const {
        createCollectionMutation,
        updateCollectionMutation,
        softDeleteCollectionMutation,
    } = useCollectionsMutations()
    const isSaving =
        createCollectionMutation.isPending || updateCollectionMutation.isPending
    const isDeleting = softDeleteCollectionMutation.isPending
    const { setAllCollection, setUntaggedCollection, setTrashCollection } =
        useSyncedUserSettings()
    const closeAllDialogs = useDialogStore((s) => s.closeAllDialogs)
    const defaultCollectionSlug = useSyncedUserSettings(
        (s) => s.defaultCollectionSlug,
    )
    const setDefaultCollectionSlug = useSyncedUserSettings(
        (s) => s.setDefaultCollectionSlug,
    )

    const isEditing = !!collection

    const [nameVal, setNameVal] = useState(collection?.name ?? "")
    const [slugVal, setSlugVal] = useState(collection?.slug ?? "")
    const [iconVal, setIconVal] = useState(collection?.icon ?? getRandomIcon())
    const [typesVal, setTypesVal] = useState<ItemType[]>(
        collection?.types ?? ALL_TYPES,
    )
    const [tagStr, setTagStr] = useState(collection?.tags.join(" ") ?? "")
    const [saveError, setSaveError] = useState<string | null>(null)
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)
    const isDefault = isEditing && collection.slug === defaultCollectionSlug

    const isSlugManuallyEditedRef = useRef(isEditing)
    const emojiBtnRef = useRef<HTMLButtonElement>(null)
    const emojiFieldRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!isEmojiPickerOpen) return
        const handleClickOutside = (e: MouseEvent) => {
            if (!emojiFieldRef.current?.contains(e.target as Node)) {
                setIsEmojiPickerOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () =>
            document.removeEventListener("mousedown", handleClickOutside)
    }, [isEmojiPickerOpen])

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNameVal(e.target.value)
        if (!isSlugManuallyEditedRef.current) {
            setSlugVal(generateSlug(e.target.value))
        }
    }

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        isSlugManuallyEditedRef.current = true
        setSlugVal(e.target.value)
    }

    const handleTagStrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const collapsed = e.target.value.replace(/  +/g, " ")
        setTagStr(collapsed)
    }

    const handleEmojiSelect = ({ emoji }: { emoji: string }) => {
        setIconVal(emoji)
        setIsEmojiPickerOpen(false)
    }

    const handleEmojiBtnClick = () => {
        setIsEmojiPickerOpen((prev) => !prev)
    }

    const handleTypeToggle = (type: ItemType) => {
        setTypesVal((prev) =>
            prev.includes(type)
                ? prev.filter((t) => t !== type)
                : [...prev, type],
        )
    }

    const handleSave = () => {
        if (!nameVal.trim()) {
            setSaveError("Name is required.")
            return
        }
        if (!slugVal.trim()) {
            setSaveError("Slug is required.")
            return
        }
        setSaveError(null)

        const now = DateTime.now().toISO()
        const tags = tagStr
            .trim()
            .split(" ")
            .filter((t) => t.length > 0)

        const newSlug = slugVal.trim()

        if (isEditing && collection.slug === defaultCollectionSlug) {
            setDefaultCollectionSlug(newSlug)
        }

        if (isEditing && collection.coreType) {
            const coreConfig = {
                name: nameVal.trim(),
                slug: newSlug,
                icon: iconVal,
                updatedAt: now,
            }
            if (collection.coreType === "all") setAllCollection(coreConfig)
            if (collection.coreType === "untagged")
                setUntaggedCollection(coreConfig)
            if (collection.coreType === "trash") setTrashCollection(coreConfig)
            closeAllDialogs()
            return
        }

        if (isEditing) {
            updateCollectionMutation.mutate({
                ...collection,
                name: nameVal.trim(),
                slug: newSlug,
                icon: iconVal,
                types: typesVal,
                tags,
                updatedAt: now,
            })
            closeAllDialogs()
            return
        }

        const userCollections = (collectionsQuery.data ?? []).filter(
            (c) => !c.coreType,
        )
        const maxSortOrder =
            userCollections.length > 0
                ? Math.max(...userCollections.map((c) => c.sortOrder))
                : 0

        createCollectionMutation.mutate({
            id: nanoid(),
            createdAt: now,
            updatedAt: now,
            name: nameVal.trim(),
            slug: newSlug,
            icon: iconVal,
            types: typesVal,
            tags,
            sortOrder: maxSortOrder + 1000,
        })

        closeAllDialogs()
    }

    const handleDelete = () => {
        if (!collection) return
        softDeleteCollectionMutation.mutate(collection)
        closeAllDialogs()
    }

    useHotkeys(SHORTCUT_SAVE_AND_CLOSE, handleSave, {
        enableOnFormTags: true,
        preventDefault: true,
    })

    const typeCheckboxes = ALL_TYPES.map((type) => (
        <label key={type} className={styles.CollectionDialog__TypeLabel}>
            <input
                type="checkbox"
                checked={typesVal.includes(type)}
                onChange={() => handleTypeToggle(type)}
            />
            {TYPE_LABELS[type]}
        </label>
    ))

    const emojiPickerPortal = isEmojiPickerOpen && (
        <div className={styles.EmojiPicker}>
            <EmojiPicker.Root onEmojiSelect={handleEmojiSelect} columns={6}>
                <EmojiPicker.Search />
                <EmojiPicker.Viewport>
                    <EmojiPicker.Loading>Loading</EmojiPicker.Loading>
                    <EmojiPicker.Empty>No emoji found.</EmojiPicker.Empty>
                    <EmojiPicker.List />
                </EmojiPicker.Viewport>
            </EmojiPicker.Root>
        </div>
    )

    const defaultSection = isEditing && (
        <div className={styles.CollectionDialog__Field}>
            {isDefault ? (
                <span className={styles.CollectionDialog__DefaultIndicator}>
                    This is currently your default collection
                </span>
            ) : (
                <button
                    className={styles.CollectionDialog__BtnSetDefault}
                    type="button"
                    onClick={() => setDefaultCollectionSlug(collection.slug)}
                >
                    Set as default collection
                </button>
            )}
        </div>
    )

    const deleteButton = isEditing && !collection.coreType && (
        <button
            className={styles.CollectionDialog__BtnDelete}
            disabled={isDeleting}
            onClick={handleDelete}
        >
            {isDeleting ? "Deleting..." : "Delete"}
        </button>
    )

    const saveButton = (
        <button
            className={styles.CollectionDialog__BtnSave}
            disabled={isSaving}
            onClick={handleSave}
        >
            {isSaving ? "Saving..." : "Save"}
        </button>
    )

    return (
        <div className={styles.CollectionDialog}>
            <button
                className={styles.CollectionDialog__CloseBtn}
                onClick={closeAllDialogs}
                aria-label="Close"
            >
                <IconX {...ICON_PROPS_ACTION} />
            </button>
            <div className="FlexRow">
                <div className={styles.CollectionDialog__Field}>
                    <label className={styles.CollectionDialog__Label}>
                        Name
                    </label>
                    <input
                        className="Dialog__Input"
                        autoFocus
                        value={nameVal}
                        onChange={handleNameChange}
                    />
                </div>
                <div className={styles.CollectionDialog__FieldAuto}>
                    <label className={styles.CollectionDialog__Label}>
                        Icon
                    </label>
                    <div
                        ref={emojiFieldRef}
                        className={styles.CollectionDialog__EmojiField}
                    >
                        <button
                            ref={emojiBtnRef}
                            type="button"
                            className={styles.CollectionDialog__EmojiBtn}
                            onClick={handleEmojiBtnClick}
                        >
                            {iconVal || "..."}
                        </button>
                        {emojiPickerPortal}
                    </div>
                </div>
            </div>
            <div className={styles.CollectionDialog__Field}>
                <label className={styles.CollectionDialog__Label}>Slug</label>
                <span className={styles.CollectionDialog__Description}>
                    For url route and searching from cmdPalette
                </span>
                <input
                    className="Dialog__Input"
                    value={slugVal}
                    onChange={handleSlugChange}
                    spellCheck={false}
                    autoCapitalize="none"
                />
            </div>
            <div className="FlexRow">
                {!collection?.coreType && (
                    <div className={styles.CollectionDialog__Field}>
                        <label className={styles.CollectionDialog__Label}>
                            Types
                        </label>
                        <span className={styles.CollectionDialog__Description}>
                            Items of selected types appear in this collection
                        </span>
                        <div className={styles.CollectionDialog__TypesRow}>
                            {typeCheckboxes}
                        </div>
                    </div>
                )}
            </div>
            <div className={styles.CollectionDialog__Field}>
                <label className={styles.CollectionDialog__Label}>Tags</label>
                <span className={styles.CollectionDialog__Description}>
                    Collection will shows item with the following tags
                    (separated by spaces)
                </span>
                <input
                    className="Dialog__Input"
                    value={tagStr}
                    onChange={handleTagStrChange}
                    placeholder=""
                    spellCheck={false}
                    autoCapitalize="none"
                />
            </div>
            {defaultSection}
            {saveError && (
                <p className={styles.CollectionDialog__Error}>{saveError}</p>
            )}
            <div className={styles.CollectionDialog__Footer}>
                <div>{deleteButton}</div>
                <div className={styles.CollectionDialog__Actions}>
                    {saveButton}
                </div>
            </div>
        </div>
    )
}
