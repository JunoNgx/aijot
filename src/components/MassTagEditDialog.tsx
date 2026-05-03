import { useState, useRef, useEffect } from "react"
import { IconX } from "@tabler/icons-react"
import { ICON_PROPS_ACTION } from "@/config/constants"
import { getHotkeyHandler } from "@/utils/hotkeyHandler"
import { SHORTCUT_SAVE_AND_CLOSE } from "@/config/constants"
import { useDialogStore } from "@/store/dialogStore"
import styles from "./MassTagEditDialog.module.scss"

interface Props {
    itemCount: number
    onSave: (tagStr: string) => void
}

export default function MassTagEditDialog({ itemCount, onSave }: Props) {
    const [tagStr, setTagStr] = useState("")
    const inputRef = useRef<HTMLInputElement>(null)
    const closeAllDialogs = useDialogStore((s) => s.closeAllDialogs)

    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    const handleTagStrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const collapsed = e.target.value.replace(/  +/g, " ")
        setTagStr(collapsed)
    }

    const handleSave = () => {
        if (!tagStr.trim()) return
        onSave(tagStr)
        closeAllDialogs()
    }

    const handleSaveAndClose = () => {
        if (!tagStr.trim()) return
        onSave(tagStr)
        closeAllDialogs()
    }

    const saveHotkeyHandler = (e: React.KeyboardEvent) => {
        const handler = getHotkeyHandler([
            [SHORTCUT_SAVE_AND_CLOSE, handleSaveAndClose],
        ])
        handler(e)
    }

    const isSaveDisabled = !tagStr.trim()

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
                <span className={styles.MassTagEditDialog__Warning}>
                    This will overwrite the tags of all currently visible items
                </span>
            </div>
            <div className={styles.MassTagEditDialog__Field}>
                <span className={styles.MassTagEditDialog__Count}>
                    {itemCount} {itemCount === 1 ? "item" : "items"} will be
                    updated
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
