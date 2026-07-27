import { useRef } from "react"
import { useAllTagsQuery } from "@/hooks/useAllTagsQuery"
import "./TagAutocompleteInput.scss"

const MAX_SUGGESTIONS = 5
const CHIP_STAGGER_MS = 30

interface TagAutocompleteInputProps {
    value: string
    onChange: (value: string) => void
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
    id?: string
    ref?: React.RefObject<HTMLInputElement | null>
}

export default function TagAutocompleteInput({
    value,
    onChange,
    onBlur,
    id = "tag-autocomplete-input",
    ref,
}: TagAutocompleteInputProps) {
    const { allTagsQuery } = useAllTagsQuery()
    const allTags = allTagsQuery.data ?? []
    const inputRef = useRef<HTMLInputElement>(null)

    const setInputRef = (node: HTMLInputElement | null) => {
        inputRef.current = node
        if (!ref) return
        ref.current = node
    }

    const lastSpaceIndex = value.lastIndexOf(" ")
    const currentToken = value.slice(lastSpaceIndex + 1)
    const normalisedCurrentToken = currentToken.toLowerCase()

    const existingTags = new Set(
        value
            .split(" ")
            .filter((tag) => tag.length > 0)
            .map((tag) => tag.toLowerCase()),
    )

    const isSuggestionActive = currentToken.length > 0
    const matchingTags = isSuggestionActive
        ? allTags.filter(
              (tag) =>
                  !existingTags.has(tag.toLowerCase()) &&
                  tag.toLowerCase().startsWith(normalisedCurrentToken),
          )
        : []

    const sortedSuggestions = matchingTags
        .slice(0, MAX_SUGGESTIONS)
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))

    const handleAccept = (tag: string) => {
        const newValue =
            lastSpaceIndex === -1
                ? `${tag} `
                : `${value.slice(0, lastSpaceIndex + 1)}${tag} `
        onChange(newValue)
        requestAnimationFrame(() => {
            const el = inputRef.current
            if (!el) return
            el.focus()
            el.setSelectionRange(newValue.length, newValue.length)
        })
    }

    const chipStrip = (
        <div className="TagAutocompleteInput__ChipStrip">
            {sortedSuggestions.map((tag, index) => (
                <button
                    key={tag}
                    type="button"
                    className="TagAutocompleteInput__Chip"
                    style={{ animationDelay: `${index * CHIP_STAGGER_MS}ms` }}
                    onPointerDown={(e) => e.preventDefault()}
                    onClick={() => handleAccept(tag)}
                >
                    {tag}
                </button>
            ))}
        </div>
    )

    return (
        <div className="TagAutocompleteInput">
            <input
                ref={setInputRef}
                id={id}
                value={value}
                onChange={(e) =>
                    onChange(e.target.value.replace(/\s\s+/g, " "))
                }
                onBlur={onBlur}
                placeholder=""
                spellCheck={false}
                autoCapitalize="none"
            />
            {chipStrip}
        </div>
    )
}
