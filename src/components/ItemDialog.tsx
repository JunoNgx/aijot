import {
    useState,
    useEffect,
    useLayoutEffect,
    useCallback,
    useRef,
} from "react"
import * as Accordion from "@radix-ui/react-accordion"
import { useHotkeys } from "react-hotkeys-hook"
import { DateTime } from "luxon"
// import { EditorView, keymap, drawSelection } from "@codemirror/view"
// import { EditorState } from "@codemirror/state"
// import { defaultKeymap, history, historyKeymap } from "@codemirror/commands"
import { IconX, IconChevronDown } from "@tabler/icons-react"
import { ICON_PROPS_ACTION } from "@/config/constants"
import { useItemsMutations } from "@/hooks/useItemsMutations"
import { useItemActions } from "@/hooks/useItemActions"
import { useDebounced } from "@/hooks/useDebounced"
import { useDialogStore } from "@/store/dialogStore"
import TagAutocompleteInput from "@/components/TagAutocompleteInput"
import { SHORTCUT_SAVE_AND_CLOSE } from "@/config/constants"
import { formatDatetime } from "@/utils/helpers"
import { openPreviousVersionDialog } from "@/utils/openPreviousVersionDialog"
import { useLocalUserSettings } from "@/store/localUserSettings"
import "./ItemDialog.scss"
import type { Item } from "@/types"

const AUTOSAVE_DEBOUNCE_MS = 5000

interface MoreOptionsAccordionProps {
    shouldCopyOnClickVal: boolean
    handleCopyOnClickChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    isPinnedVal: boolean
    handleIsPinnedChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    isRedactedVal: boolean
    handleIsRedactedChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    jottedAtInputVal: string
    handleJottedAtChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    isLinkItem: boolean
    faviconUrlVal: string
    handleFaviconUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    item: Item
}

function MoreOptionsAccordion({
    shouldCopyOnClickVal,
    handleCopyOnClickChange,
    isPinnedVal,
    handleIsPinnedChange,
    isRedactedVal,
    handleIsRedactedChange,
    jottedAtInputVal,
    handleJottedAtChange,
    isLinkItem,
    faviconUrlVal,
    handleFaviconUrlChange,
    item,
}: MoreOptionsAccordionProps) {
    return (
        <Accordion.Item value="advanced" className="MoreOptionsAccordion__Item">
            <Accordion.Header className="MoreOptionsAccordion__Header">
                <Accordion.Trigger className="MoreOptionsAccordion__Trigger">
                    <span>More options</span>
                    <IconChevronDown
                        {...ICON_PROPS_ACTION}
                        className="MoreOptionsAccordion__Chevron"
                    />
                </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="MoreOptionsAccordion__Content">
                <div className="MoreOptionsAccordion__ContentInner">
                    <div className="ItemDialog__Field">
                        <label className="ItemDialog__Checkbox">
                            <input
                                type="checkbox"
                                checked={shouldCopyOnClickVal}
                                onChange={handleCopyOnClickChange}
                            />
                            Copy content on click as primary action
                        </label>
                    </div>
                    <div className="ItemDialog__Field">
                        <label className="ItemDialog__Checkbox">
                            <input
                                type="checkbox"
                                checked={isPinnedVal}
                                onChange={handleIsPinnedChange}
                            />
                            Pin this item
                        </label>
                    </div>
                    {item.type !== "todo" && (
                        <div className="ItemDialog__Field">
                            <label className="ItemDialog__Checkbox">
                                <input
                                    type="checkbox"
                                    checked={isRedactedVal}
                                    onChange={handleIsRedactedChange}
                                />
                                Redact content in list
                            </label>
                        </div>
                    )}
                    <div className="ItemDialog__Field">
                        <label className="ItemDialog__Label">Jotted at</label>
                        <input
                            className="ItemDialog__HalfInput"
                            type="datetime-local"
                            value={jottedAtInputVal}
                            onChange={handleJottedAtChange}
                        />
                    </div>
                    {isLinkItem && (
                        <div className="ItemDialog__Field">
                            <label className="ItemDialog__Label">Favicon</label>
                            <input
                                className="ItemDialog__HalfInput"
                                value={faviconUrlVal}
                                onChange={handleFaviconUrlChange}
                                placeholder="https://..."
                            />
                        </div>
                    )}
                    {item.previousContent && (
                        <button
                            className="ItemDialog__BtnAction ItemDialog__BtnPrevVersion"
                            onClick={() => openPreviousVersionDialog(item)}
                        >
                            View previous version
                        </button>
                    )}
                </div>
            </Accordion.Content>
        </Accordion.Item>
    )
}

// interface CodeMirrorEditorProps {
//     initialValue: string
//     onChange: (value: string) => void
//     onSaveAndClose: () => void
//     isReadOnly?: boolean
// }

// function CodeMirrorEditor({
//     initialValue,
//     onChange,
//     onSaveAndClose,
//     isReadOnly = false,
// }: CodeMirrorEditorProps) {
//     const containerRef = useRef<HTMLDivElement>(null)
//     const onChangeRef = useRef(onChange)
//     const onSaveAndCloseRef = useRef(onSaveAndClose)
//     useLayoutEffect(() => {
//         onChangeRef.current = onChange
//         onSaveAndCloseRef.current = onSaveAndClose
//     })

//     useLayoutEffect(() => {
//         if (!containerRef.current) return
//         const view = new EditorView({
//             state: EditorState.create({
//                 doc: initialValue,
//                 extensions: [
//                     history(),
//                     drawSelection(),
//                     EditorView.editable.of(!isReadOnly),
//                     EditorState.readOnly.of(isReadOnly),
//                     // Element is outside of react tree,
//                     // this must be declared here
//                     EditorView.theme({
//                         ".cm-cursor, .cm-dropCursor": {
//                             borderLeftColor: "var(--colText)",
//                         },
//                     }),
//                     keymap.of([
//                         {
//                             key: "Mod-s",
//                             run: () => {
//                                 onSaveAndCloseRef.current()
//                                 return true
//                             },
//                         },
//                         ...defaultKeymap,
//                         ...historyKeymap,
//                     ]),
//                     EditorView.lineWrapping,
//                     EditorView.updateListener.of((update) => {
//                         if (update.docChanged) {
//                             onChangeRef.current(update.state.doc.toString())
//                         }
//                     }),
//                 ],
//             }),
//             parent: containerRef.current,
//         })
//         if (!isReadOnly) {
//             // TODO: hacky, find better solution
//             setTimeout(() => {
//                 view.focus()
//             }, 0)
//         }
//         return () => view.destroy()
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [])

//     return <div ref={containerRef} className="CodeMirror" />
// }

interface Props {
    item: Item
    onClose?: () => void
}

export default function ItemDialog({ item, onClose }: Props) {
    const { updateItemMutation, refetchLinkMetaMutation, trashItemMutation } =
        useItemsMutations()
    const { trashItem } = useItemActions()
    const isSaving = updateItemMutation.isPending
    const isDeleting = trashItemMutation.isPending
    const isRefetching = refetchLinkMetaMutation.isPending
    const closeAllDialogs = useDialogStore((s) => s.closeAllDialogs)
    const is24HourClock = useLocalUserSettings((s) => s.is24HourClock)

    const [titleVal, setTitleVal] = useState(item.title ?? "")
    const [contentVal, setContentVal] = useState(item.content)
    const [tagStr, setTagStr] = useState(item.tags.join(" "))
    const [jottedAtVal, setJottedAtVal] = useState<string | null>(item.jottedAt)
    const [faviconUrlVal, setFaviconUrlVal] = useState(item.faviconUrl ?? "")
    const [shouldCopyOnClickVal, setShouldCopyOnClickVal] = useState(
        item.shouldCopyOnClick ?? false,
    )
    const [isPinnedVal, setIsPinnedVal] = useState(item.isPinned ?? false)
    const [isRedactedVal, setIsRedactedVal] = useState(item.isRedacted ?? false)
    const [saveStatusText, setSaveStatusText] = useState(
        `Saved ${formatDatetime(item.updatedAt, is24HourClock)}`,
    )

    const titleRef = useRef(titleVal)
    const contentRef = useRef(contentVal)
    const contentTextareaRef = useRef<HTMLTextAreaElement>(null)
    const tagStrRef = useRef(tagStr)
    const jottedAtRef = useRef(jottedAtVal)
    const faviconUrlRef = useRef(faviconUrlVal)
    const shouldCopyOnClickRef = useRef(shouldCopyOnClickVal)
    const isPinnedRef = useRef(isPinnedVal)
    const isRedactedRef = useRef(isRedactedVal)
    const hasUnsavedChangesRef = useRef(false)
    const isFirstRender = useRef(true)
    const mutateRef = useRef(updateItemMutation.mutate)
    useLayoutEffect(() => {
        mutateRef.current = updateItemMutation.mutate
    })

    useLayoutEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false
            setTimeout(() => {
                contentTextareaRef.current?.focus()
            }, 0)
        }
    })

    useEffect(() => {
        titleRef.current = titleVal
    }, [titleVal])
    useEffect(() => {
        contentRef.current = contentVal
    }, [contentVal])
    useEffect(() => {
        tagStrRef.current = tagStr
    }, [tagStr])
    useEffect(() => {
        jottedAtRef.current = jottedAtVal
    }, [jottedAtVal])
    useEffect(() => {
        faviconUrlRef.current = faviconUrlVal
    }, [faviconUrlVal])
    useEffect(() => {
        shouldCopyOnClickRef.current = shouldCopyOnClickVal
    }, [shouldCopyOnClickVal])
    useEffect(() => {
        isPinnedRef.current = isPinnedVal
    }, [isPinnedVal])
    useEffect(() => {
        isRedactedRef.current = isRedactedVal
    }, [isRedactedVal])

    const isLinkItem = item.type === "link"
    const isTextItem = item.type === "text"
    const isTodoItem = item.type === "todo"

    const buildUpdatedItem = useCallback(
        (): Item => ({
            ...item,
            title: titleRef.current.trim() || undefined,
            content: contentRef.current,
            tags: tagStrRef.current
                .replace(/  +/g, " ")
                .trim()
                .split(" ")
                .filter((t) => t.length > 0),
            jottedAt: jottedAtRef.current ?? item.jottedAt,
            faviconUrl: isLinkItem
                ? faviconUrlRef.current.trim() || undefined
                : undefined,
            shouldCopyOnClick: shouldCopyOnClickRef.current || undefined,
            isPinned: isPinnedRef.current || undefined,
            isRedacted: isRedactedRef.current || undefined,
            updatedAt: DateTime.now().toISO(),
        }),
        [item, isLinkItem],
    )

    const handleRefetchMeta = useCallback(() => {
        refetchLinkMetaMutation.mutate(item)
        closeAllDialogs()
    }, [item, refetchLinkMetaMutation, closeAllDialogs])

    const handleSave = useCallback(() => {
        mutateRef.current(buildUpdatedItem())
        setSaveStatusText(
            `Saved ${formatDatetime(DateTime.now().toISO(), is24HourClock)}`,
        )
        hasUnsavedChangesRef.current = false
    }, [buildUpdatedItem, is24HourClock])

    const handleSaveAndClose = useCallback(() => {
        handleSave()
        closeAllDialogs()
    }, [handleSave, closeAllDialogs])

    useHotkeys(SHORTCUT_SAVE_AND_CLOSE, handleSaveAndClose, {
        enableOnFormTags: true,
        preventDefault: true,
    })

    const debouncedSave = useDebounced(handleSave, AUTOSAVE_DEBOUNCE_MS)

    const markChanged = () => {
        hasUnsavedChangesRef.current = true
        setSaveStatusText("Pending changes...")
        debouncedSave()
    }

    const handleTitleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitleVal(e.target.value)
        markChanged()
    }

    // const handleCodeMirrorChange = (value: string) => {
    //     contentRef.current = value
    //     markChanged()
    // }

    const handleTagStrChange = (value: string) => {
        setTagStr(value)
        markChanged()
    }

    const handleTagStrBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const collapsed = e.target.value.replace(/  +/g, " ")
        if (collapsed !== tagStr) {
            setTagStr(collapsed)
        }
    }

    const handleJottedAtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.value) return
        const isoValue = DateTime.fromISO(e.target.value).toISO()
        if (!isoValue) return
        setJottedAtVal(isoValue)
        markChanged()
    }

    const handleFaviconUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFaviconUrlVal(e.target.value)
        markChanged()
    }

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContentVal(e.target.value)
        markChanged()
    }

    const handleCopyOnClickChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        setShouldCopyOnClickVal(e.target.checked)
        markChanged()
    }

    const handleIsPinnedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsPinnedVal(e.target.checked)
        markChanged()
    }

    const handleIsRedactedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsRedactedVal(e.target.checked)
        markChanged()
    }

    const handleDeleteClick = () => {
        trashItem(item)
        closeAllDialogs()
    }

    // Save on unmount if there are unsaved changes the debounce hasn't flushed yet
    useEffect(() => {
        return () => {
            if (!hasUnsavedChangesRef.current) return
            mutateRef.current(buildUpdatedItem())
        }
    }, [buildUpdatedItem])

    useEffect(() => {
        return () => {
            onClose?.()
        }
    }, [onClose])

    const jottedAtInputVal = jottedAtVal
        ? DateTime.fromISO(jottedAtVal).toLocal().toFormat("yyyy-MM-dd'T'HH:mm")
        : ""

    const contentEditor = (
        <textarea
            ref={contentTextareaRef}
            className="Dialog__Input ItemDialog__Textarea"
            rows={isTextItem ? 24 : 4}
            value={contentVal}
            onChange={handleContentChange}
        />
    )

    const deleteButton = (
        <button
            className="ItemDialog__BtnDelete"
            disabled={isDeleting}
            onClick={handleDeleteClick}
        >
            {isDeleting ? "Deleting..." : "Delete"}
        </button>
    )

    const refetchButton = isLinkItem && (
        <button
            className="ItemDialog__BtnAction"
            disabled={isRefetching}
            onClick={handleRefetchMeta}
        >
            {isRefetching ? "Refetching..." : "Refetch meta"}
        </button>
    )

    const saveButton = (
        <button
            className="ItemDialog__BtnSave"
            disabled={isSaving}
            onClick={handleSaveAndClose}
        >
            Save
        </button>
    )

    return (
        <div className="ItemDialog">
            <button
                className="ItemDialog__CloseBtn"
                onClick={closeAllDialogs}
                aria-label="Close"
            >
                <IconX {...ICON_PROPS_ACTION} />
            </button>
            {!isTodoItem && (
                <div className="ItemDialog__Field">
                    <label className="ItemDialog__Label">Title</label>
                    <input
                        className="Dialog__Input"
                        value={titleVal}
                        onChange={handleTitleInputChange}
                    />
                </div>
            )}
            <div className="ItemDialog__Field">
                {isTodoItem && (
                    <label className="ItemDialog__Label">Item</label>
                )}
                {contentEditor}
            </div>
            <div className="ItemDialog__SaveStatusWrapper">
                <span className="ItemDialog__SaveStatus">{saveStatusText}</span>
            </div>
            <div className="ItemDialog__Field">
                <label className="ItemDialog__Label">Tags</label>
                <span className="ItemDialog__Description">
                    Separated by spaces
                </span>
                <TagAutocompleteInput
                    value={tagStr}
                    onChange={handleTagStrChange}
                    onBlur={handleTagStrBlur}
                    id="item-tag-input"
                />
            </div>
            <Accordion.Root type="multiple" className="MoreOptionsAccordion">
                <MoreOptionsAccordion
                    shouldCopyOnClickVal={shouldCopyOnClickVal}
                    handleCopyOnClickChange={handleCopyOnClickChange}
                    isPinnedVal={isPinnedVal}
                    handleIsPinnedChange={handleIsPinnedChange}
                    isRedactedVal={isRedactedVal}
                    handleIsRedactedChange={handleIsRedactedChange}
                    jottedAtInputVal={jottedAtInputVal}
                    handleJottedAtChange={handleJottedAtChange}
                    isLinkItem={isLinkItem}
                    faviconUrlVal={faviconUrlVal}
                    handleFaviconUrlChange={handleFaviconUrlChange}
                    item={item}
                />
            </Accordion.Root>
            <div className="ItemDialog__Footer">
                {deleteButton}
                <div className="ItemDialog__FooterRight">
                    {refetchButton}
                    {saveButton}
                </div>
            </div>
        </div>
    )
}
