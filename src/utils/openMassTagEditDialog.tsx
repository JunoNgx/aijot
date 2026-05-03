import { useDialogStore } from "@/store/dialogStore"
import MassTagEditDialog from "@/components/MassTagEditDialog"

interface OpenMassTagEditDialogOptions {
    itemCount: number
    onSave: (tagStr: string) => void
}

export function openMassTagEditDialog({
    itemCount,
    onSave,
}: OpenMassTagEditDialogOptions) {
    useDialogStore.getState().openDialog({
        children: <MassTagEditDialog itemCount={itemCount} onSave={onSave} />,
    })
}
