import { useDialogStore } from "@/store/dialogStore"
import MassTagEditDialog from "@/components/MassTagEditDialog"
import type { Item, MassTagEditMode } from "@/types"

interface OpenMassTagEditDialogOptions {
    items: Item[]
    onSave: (tagStr: string, mode: MassTagEditMode) => void
}

export function openMassTagEditDialog({
    items,
    onSave,
}: OpenMassTagEditDialogOptions) {
    useDialogStore.getState().openDialog({
        children: <MassTagEditDialog items={items} onSave={onSave} />,
    })
}
