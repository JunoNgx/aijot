import { useState, useRef, useEffect, useMemo } from "react"
import { IconX } from "@tabler/icons-react"
import { ICON_PROPS_ACTION } from "@/config/constants"
import { getHotkeyHandler } from "@/utils/hotkeyHandler"
import { SHORTCUT_SAVE_AND_CLOSE } from "@/config/constants"
import { useDialogStore } from "@/store/dialogStore"
import type { Item, MassTagEditMode } from "@/types"
import styles from "./MassTagEditDialog.module.scss"

type MassTagMode = MassTagEditMode

interface Props {
    items: Item[]
    onSave: (tagStr: string, mode: MassTagMode) => void
}

const MODE_DETAILS: Record<
    MassTagMode,
    { label: string; description: string }
> = {
    add: {
        label: "Add",
        description: "New tags will be merged with existing tags",
    },
    replace: {
        label: "Replace",
        description: "All existing tags will be replaced with new tags",
    },
    remove: {
        label: "Remove",
        description: "Specified tags will be removed from existing tags",
    },
}

const MAX_SHOWN_TAGS = 5

export default function MassTagEditDialog({ items, onSave }: Props) {
    const [tagStr, setTagStr] = useState("")
    const [mode, setMode] = useState<MassTagMode>("replace")
    const inputRef = useRef<HTMLInputElement>(null)
    const closeAllDialogs = useDialogStore((s) => s.closeAllDialogs)

    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    const tagSummaryData = useMemo(() => {
        const counts: Record<string, number> = {}
        items.forEach((item) => {
            item.tags.forEach((tag) => {
                counts[tag] = (counts[tag] || 0) + 1
            })
        })
        const allTagCounts = Object.entries(counts).sort((a, b) => b[1] - a[1])
        const totalUniqueTags = allTagCounts.length
        const topTagCounts = allTagCounts.slice(0, MAX_SHOWN_TAGS)
        return { topTagCounts, totalUniqueTags }
    }, [items])

    const { topTagCounts, totalUniqueTags } = tagSummaryData

    const handleTagStrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const collapsed = e.target.value.replace(/  +/g, " ")
        setTagStr(collapsed)
    }

    const handleSave = () => {
        onSave(tagStr, mode)
        closeAllDialogs()
    }

    const handleSaveAndClose = () => {
        onSave(tagStr, mode)
        closeAllDialogs()
    }

    const saveHotkeyHandler = (e: React.KeyboardEvent) => {
        const handler = getHotkeyHandler([
            [SHORTCUT_SAVE_AND_CLOSE, handleSaveAndClose],
        ])
        handler(e)
    }

    const isSaveDisabled = mode !== "remove" && !tagStr.trim()

    const selectedModeDetail = MODE_DETAILS[mode]

    return (
        <div className={styles.MassTagEditDialog}>
            <button
                className={styles.MassTagEditDialog__CloseBtn}
                onClick={closeAllDialogs}
                aria-label="Close"
            >
                <IconX {...ICON_PROPS_ACTION} />
            </button>
            <div className={styles.MassTagEditDialog__Field}>
                <span className={styles.MassTagEditDialog__Count}>
                    {items.length} {items.length === 1 ? "item" : "items"} will
                    be updated
                </span>
            </div>
            {totalUniqueTags > 0 && (
                <div className={styles.MassTagEditDialog__Field}>
                    <span className={styles.MassTagEditDialog__TagSummary}>
                        {topTagCounts.map(([tag, count]) => (
                            <span
                                key={tag}
                                className={styles.MassTagEditDialog__Tag}
                            >
                                <span
                                    className={
                                        styles.MassTagEditDialog__TagName
                                    }
                                >
                                    {tag}
                                </span>
                                <span
                                    className={
                                        styles.MassTagEditDialog__TagCount
                                    }
                                >
                                    ({count})
                                </span>
                            </span>
                        ))}
                        {totalUniqueTags > MAX_SHOWN_TAGS && (
                            <span className={styles.MassTagEditDialog__TagMore}>
                                +{totalUniqueTags - MAX_SHOWN_TAGS} more
                            </span>
                        )}
                    </span>
                </div>
            )}
            <div className={styles.MassTagEditDialog__Field}>
                <div
                    className={styles.MassTagEditDialog__ModeGroup}
                    role="radiogroup"
                    aria-label="Tag operation mode"
                >
                    {(Object.keys(MODE_DETAILS) as MassTagMode[]).map((m) => (
                        <label
                            key={m}
                            className={styles.MassTagEditDialog__ModeLabel}
                        >
                            <input
                                type="radio"
                                name="mass-tag-mode"
                                value={m}
                                checked={m === mode}
                                onChange={() => setMode(m)}
                            />
                            {MODE_DETAILS[m].label}
                        </label>
                    ))}
                </div>
                <span className={styles.MassTagEditDialog__ModeDescription}>
                    {selectedModeDetail.description}
                </span>
            </div>
            <div className={styles.MassTagEditDialog__Field}>
                <label className={styles.MassTagEditDialog__Label}>Tags</label>
                <span className={styles.MassTagEditDialog__Description}>
                    Separated by spaces
                </span>
                <input
                    className="Dialog__Input"
                    ref={inputRef}
                    value={tagStr}
                    onChange={handleTagStrChange}
                    onKeyDown={saveHotkeyHandler}
                    placeholder=""
                />
            </div>
            <div className={styles.MassTagEditDialog__Footer}>
                <button
                    className={styles.MassTagEditDialog__BtnCancel}
                    onClick={closeAllDialogs}
                >
                    Cancel
                </button>
                <div className={styles.MassTagEditDialog__FooterRight}>
                    <button
                        className={styles.MassTagEditDialog__BtnSave}
                        disabled={isSaveDisabled}
                        onClick={handleSave}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    )
}
