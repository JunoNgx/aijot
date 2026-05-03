import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { toast } from "sonner"
import {
    IconChevronDown,
    IconLayoutNavbar,
    IconCheckbox,
    IconClipboardPlus,
    IconX,
    IconFocus,
    IconTags,
} from "@tabler/icons-react"
import { useCommandPaletteStore } from "@/store/commandPaletteStore"
import { useTransientUiState } from "@/store/transientUiState"
import { useItemsMutations } from "@/hooks/useItemsMutations"
import { openMassTagEditDialog } from "@/utils/openMassTagEditDialog"
import {
    SYNTAX_PREFIX_TODO,
    SYNTAX_PREFIX_LONG_TEXT,
    ICON_PROPS_ITEM_DROPDOWN,
} from "@/config/constants"
import styles from "./MainInputExtendedMenu.module.scss"

interface Props {
    inputValue: string
    setInputValue: (val: string) => void
    inputRef: React.RefObject<HTMLInputElement | null>
    onSubmit: () => void
}

export default function MainInputExtendedMenu({
    inputValue,
    setInputValue,
    inputRef,
    onSubmit,
}: Props) {
    const visibleItems = useTransientUiState((s) => s.mainListVisibleItems)
    const { massTagEditMutation } = useItemsMutations()
    const prependSyntax = (syntax: string, shouldAddSpace = false) => {
        const newValue = shouldAddSpace
            ? `${syntax} ${inputValue}`
            : `${syntax}${inputValue}`
        setInputValue(newValue)
        inputRef.current?.focus()
    }

    const handleFromClipboard = async () => {
        if (!navigator.clipboard.readText) {
            toast.error("Clipboard access is not available in this browser")
            return
        }

        try {
            const clipboardContent = await navigator.clipboard.readText()
            onSubmit()
            setInputValue(clipboardContent)
            inputRef.current?.focus()
        } catch {
            toast.error("Failed to read clipboard. Check permissions.")
        }
    }

    const handleClearInput = () => {
        setInputValue("")
        inputRef.current?.focus()
    }

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger
                className={styles.MainInputExtendedMenu__Trigger}
                aria-label="Main input options"
            >
                <IconChevronDown {...ICON_PROPS_ITEM_DROPDOWN} />
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    className={styles.MainInputExtendedMenu__Content}
                    align="end"
                    alignOffset={-10}
                    sideOffset={16}
                >
                    <DropdownMenu.Label
                        className={styles.MainInputExtendedMenu__GroupLabel}
                    >
                        New item
                    </DropdownMenu.Label>

                    <DropdownMenu.Item
                        className={styles.MainInputExtendedMenu__Item}
                        onSelect={() =>
                            prependSyntax(SYNTAX_PREFIX_LONG_TEXT, true)
                        }
                    >
                        <IconLayoutNavbar {...ICON_PROPS_ITEM_DROPDOWN} />
                        with title
                    </DropdownMenu.Item>

                    <DropdownMenu.Item
                        className={styles.MainInputExtendedMenu__Item}
                        onSelect={() => prependSyntax(SYNTAX_PREFIX_TODO, true)}
                    >
                        <IconCheckbox {...ICON_PROPS_ITEM_DROPDOWN} />
                        as todo
                    </DropdownMenu.Item>

                    <DropdownMenu.Item
                        className={styles.MainInputExtendedMenu__Item}
                        onSelect={handleFromClipboard}
                    >
                        <IconClipboardPlus {...ICON_PROPS_ITEM_DROPDOWN} />
                        from clipboard
                    </DropdownMenu.Item>

                    <DropdownMenu.Separator
                        className={styles.MainInputExtendedMenu__Separator}
                    />

                    <DropdownMenu.Label
                        className={styles.MainInputExtendedMenu__GroupLabel}
                    >
                        Misc
                    </DropdownMenu.Label>

                    <DropdownMenu.Item
                        className={styles.MainInputExtendedMenu__Item}
                        onSelect={handleClearInput}
                    >
                        <IconX {...ICON_PROPS_ITEM_DROPDOWN} />
                        clear input
                    </DropdownMenu.Item>

                    {visibleItems.length > 0 && (
                        <DropdownMenu.Item
                            className={styles.MainInputExtendedMenu__Item}
                            onSelect={() =>
                                openMassTagEditDialog({
                                    items: visibleItems,
                                    onSave: (tagStr, mode) =>
                                        massTagEditMutation.mutate({
                                            items: visibleItems,
                                            tagStr,
                                            mode,
                                        }),
                                })
                            }
                        >
                            <IconTags {...ICON_PROPS_ITEM_DROPDOWN} />
                            mass edit tags
                        </DropdownMenu.Item>
                    )}

                    <DropdownMenu.Item
                        className={styles.MainInputExtendedMenu__Item}
                        onSelect={() =>
                            useCommandPaletteStore.getState().open("main")
                        }
                    >
                        <IconFocus {...ICON_PROPS_ITEM_DROPDOWN} />
                        open cmdPalette
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    )
}
