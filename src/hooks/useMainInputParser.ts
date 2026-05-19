import { useMemo } from "react"
import {
    SYNTAX_PREFIX_TODO,
    SYNTAX_PREFIX_LONG_TEXT,
    SYNTAX_FLAG_TAG,
    SYNTAX_FLAG_COLLECTION,
    SYNTAX_FLAG_COMMON_PREFIX,
    SYNTAX_FILTER_TYPE_TEXT,
    SYNTAX_FILTER_TYPE_LINK,
    SYNTAX_FILTER_TYPE_TODO,
    SYNTAX_FILTER_TYPE_INCOMPLETE_TODO,
    SYNTAX_FILTER_TYPE_COMPLETED_TODO,
    SYNTAX_SEARCH_TAG_PREFIX,
} from "@/config/constants"
import type {
    MainInputCreationData,
    MainInputSearchData,
    FilterType,
} from "@/types"

function isUrl(input: string): boolean {
    try {
        const url = new URL(input)
        return url.protocol === "http:" || url.protocol === "https:"
    } catch {
        // no protocol -- try as bare domain
    }
    try {
        const url = new URL(`https://${input}`)
        return url.hostname.includes(".") && !input.includes(" ")
    } catch {
        return false
    }
}

function detectFilterType(input: string): FilterType | undefined {
    const lower = input.toLowerCase()
    if (lower.includes(SYNTAX_FILTER_TYPE_INCOMPLETE_TODO))
        return "incompleteTodo"
    if (lower.includes(SYNTAX_FILTER_TYPE_COMPLETED_TODO))
        return "completedTodo"
    if (lower.includes(SYNTAX_FILTER_TYPE_TODO)) return "todo"
    if (lower.includes(SYNTAX_FILTER_TYPE_TEXT)) return "text"
    if (lower.includes(SYNTAX_FILTER_TYPE_LINK)) return "link"
    return undefined
}

function extractTagSearches(input: string): string[] {
    return input
        .split(" ")
        .filter((token) => token.startsWith(SYNTAX_SEARCH_TAG_PREFIX))
        .map((token) => token.slice(SYNTAX_SEARCH_TAG_PREFIX.length))
        .filter((tag) => tag.length > 0)
}

function parseCreationFlags(input: string): {
    content: string
    tags: string[]
    colSlugs: string[]
} {
    const tagIndex = input.indexOf(SYNTAX_FLAG_TAG)
    const collectionIndex = input.indexOf(SYNTAX_FLAG_COLLECTION)

    const hasFlagSyntax = tagIndex > -1 || collectionIndex > -1
    if (!hasFlagSyntax) {
        return { content: input, tags: [], colSlugs: [] }
    }

    const flagStart = Math.min(
        tagIndex === -1 ? collectionIndex : tagIndex,
        collectionIndex === -1 ? tagIndex : collectionIndex,
    )

    const content = input.slice(0, flagStart).trim()

    // `::tg tag1 tag2 ::col slug1 slug2`
    const flagsStr = input.slice(flagStart)
    const tags = extractFlagArgs(flagsStr, SYNTAX_FLAG_TAG)
    const colSlugs = extractFlagArgs(flagsStr, SYNTAX_FLAG_COLLECTION)

    return { content, tags, colSlugs }
}

function extractFlagArgs(allFlagsStr: string, targetFlagSyntax: string) {
    const targetFlagStartsIndex = allFlagsStr.indexOf(targetFlagSyntax)
    if (targetFlagStartsIndex === -1) {
        return []
    }

    const afterTargetFlagStr = allFlagsStr.slice(
        targetFlagStartsIndex + targetFlagSyntax.length,
    )

    const argStr = afterTargetFlagStr.split(SYNTAX_FLAG_COMMON_PREFIX)[0].trim()
    const argArr = argStr.split(" ").filter((word) => word.length > 0)
    return argArr
}

function extractSearchText(trimmedInputText: string): string | undefined {
    const textWithoutFilterSyntax = trimmedInputText
        .replace(SYNTAX_FILTER_TYPE_INCOMPLETE_TODO, "")
        .replace(SYNTAX_FILTER_TYPE_COMPLETED_TODO, "")
        .replace(SYNTAX_FILTER_TYPE_TODO, "")
        .replace(SYNTAX_FILTER_TYPE_TEXT, "")
        .replace(SYNTAX_FILTER_TYPE_LINK, "")
        .trim()

    const tokens = textWithoutFilterSyntax.split(" ")
    const nonTagTokens = tokens.filter(
        (token) => !token.startsWith(SYNTAX_SEARCH_TAG_PREFIX),
    )
    const text = nonTagTokens.join(" ").trim()

    return text || undefined
}

function parseSearchData(raw: string): MainInputSearchData {
    const trimmedInputText = raw.trim()
    return {
        filterType: detectFilterType(trimmedInputText),
        tags: extractTagSearches(trimmedInputText),
        searchText: extractSearchText(trimmedInputText),
    }
}

function parseCreationData(raw: string): MainInputCreationData {
    const trimmedInputText = raw.trim()
    const {
        content: parsedContent,
        tags,
        colSlugs,
    } = parseCreationFlags(trimmedInputText)

    if (parsedContent.startsWith(SYNTAX_PREFIX_TODO)) {
        return {
            itemType: "todo",
            content: parsedContent.slice(SYNTAX_PREFIX_TODO.length).trim(),
            tags,
            colSlugs,
        }
    }

    if (parsedContent.startsWith(SYNTAX_PREFIX_LONG_TEXT)) {
        const title = parsedContent.slice(SYNTAX_PREFIX_LONG_TEXT.length).trim()
        return {
            itemType: "text",
            content: "",
            title: title || undefined,
            tags,
            colSlugs,
        }
    }

    const isUrlInput = isUrl(parsedContent)
    const normalizedUrl =
        isUrlInput && !parsedContent.startsWith("http")
            ? `https://${parsedContent}`
            : parsedContent

    return {
        itemType: isUrlInput ? "link" : "text",
        content: normalizedUrl,
        tags,
        colSlugs,
    }
}

// Run on every keystroke, so memoized
function useMainInputParser(input: string): MainInputSearchData {
    return useMemo(() => parseSearchData(input), [input])
}

export { parseCreationData, useMainInputParser }
