import styles from "./ImportPreview.module.scss"

interface Props {
    newItems: number
    updatedItems: number
    newCollections: number
    updatedCollections: number
    onConfirm: () => void
    onCancel: () => void
}

export default function ImportPreview({
    newItems,
    updatedItems,
    newCollections,
    updatedCollections,
    onConfirm,
    onCancel,
}: Props) {
    return (
        <div className={styles.ImportPreview}>
            <span>
                {newItems} new, {updatedItems} updated items
            </span>
            <span>
                {newCollections} new, {updatedCollections} updated collections
            </span>
            <div className={styles.ImportPreviewActions}>
                <button
                    className={styles.BtnAction}
                    type="button"
                    onClick={onConfirm}
                >
                    Confirm
                </button>
                <button
                    className={styles.BtnAction}
                    type="button"
                    onClick={onCancel}
                >
                    Cancel
                </button>
            </div>
        </div>
    )
}
