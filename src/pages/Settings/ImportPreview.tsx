import "./ImportPreview.scss"

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
        <div className="ImportPreview">
            <span>
                {newItems} new, {updatedItems} updated items
            </span>
            <span>
                {newCollections} new, {updatedCollections} updated collections
            </span>
            <div className="ImportPreview__Actions">
                <button
                    className="ImportPreview__BtnAction"
                    type="button"
                    onClick={onConfirm}
                >
                    Confirm
                </button>
                <button
                    className="ImportPreview__BtnAction"
                    type="button"
                    onClick={onCancel}
                >
                    Cancel
                </button>
            </div>
        </div>
    )
}
