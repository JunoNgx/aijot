import { DateTime } from "luxon"
import { nanoid } from "nanoid"
import type { Collection, Item, ItemType, MainInputCreationData } from "@/types"

export function buildDemoItems(): Item[] {
    const base = DateTime.now()
    const at = (minutesAgo: number) =>
        base.minus({ minutes: minutesAgo }).toUTC().toISO()
    return [
        {
            id: nanoid(),
            type: "link",
            content: "https://www.mozilla.org/en-US/",
            title: "Mozilla",
            tags: ["organisation", "web", "pretty"],
            faviconUrl:
                "https://www.mozilla.org/media/img/favicons/mozilla/apple-touch-icon.05aa000f6748.png",
            createdAt: at(12),
            jottedAt: at(12),
            updatedAt: at(12),
        },
        {
            id: nanoid(),
            type: "link",
            content: "https://xkcd.com/",
            title: "xkcd",
            tags: ["fun"],
            faviconUrl: "https://xkcd.com/s/919f27.ico",
            createdAt: at(11),
            jottedAt: at(11),
            updatedAt: at(11),
        },
        {
            id: nanoid(),
            type: "link",
            content:
                "https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_code_values",
            title: "Keyboard code reference",
            tags: ["work", "programming", "web"],
            faviconUrl: "https://developer.mozilla.org/favicon.ico",
            createdAt: at(10),
            jottedAt: at(10),
            updatedAt: at(10),
        },
        {
            id: nanoid(),
            type: "link",
            content: "https://fredrocha.net/2025/05/21/small-web-is-beautiful/",
            title: "Small (web) is beautiful",
            tags: ["small-web", "essay", "goodread", "web"],
            faviconUrl:
                "https://fredrocha.net/wp-content/themes/fredrocha.net/favicon.png",
            createdAt: at(9),
            jottedAt: at(9),
            updatedAt: at(9),
        },
        {
            id: nanoid(),
            type: "text",
            title: "Hexcode validator func",
            content: `export const isValidHexColourCode = (str: string): boolean => {
    const hexColourCodeRegEx = /(^#[A-Fa-f0-9]{6}$)/;
    return hexColourCodeRegEx.test(str);
}`,
            tags: ["work", "web", "programming"],
            createdAt: at(8),
            jottedAt: at(8),
            updatedAt: at(8),
        },
        {
            id: nanoid(),
            type: "todo",
            content: "Submit PR to fix keyboard shortcut",
            tags: ["work", "programming"],
            isDone: false,
            createdAt: at(7),
            jottedAt: at(7),
            updatedAt: at(7),
        },
        {
            id: nanoid(),
            type: "text",
            title: "Carian Knight build",
            content: `Lvl: 150
Astrologer

VIG 60
MIN 31
END 20
STR 10
DEX 12
INT 80
FAI 7
ARC 9`,
            tags: ["er"],
            createdAt: at(6),
            jottedAt: at(6),
            updatedAt: at(6),
        },
        {
            id: nanoid(),
            type: "todo",
            content: "Try Quadrilateral Cowboy",
            tags: [],
            isDone: false,
            createdAt: at(5),
            jottedAt: at(5),
            updatedAt: at(5),
        },
        {
            id: nanoid(),
            type: "todo",
            content: "Buy bacon",
            tags: ["chore"],
            isDone: true,
            createdAt: at(4),
            jottedAt: at(4),
            updatedAt: at(4),
        },
        {
            id: nanoid(),
            type: "todo",
            content: "Refill toilet supplies",
            tags: ["chore"],
            isDone: true,
            createdAt: at(3),
            jottedAt: at(3),
            updatedAt: at(3),
        },
        {
            id: nanoid(),
            type: "todo",
            content: "Get Carian Slicer",
            tags: ["er"],
            isDone: false,
            createdAt: at(2),
            jottedAt: at(2),
            updatedAt: at(2),
        },
        {
            id: nanoid(),
            type: "todo",
            content: "Get Sword Dance",
            tags: ["er"],
            isDone: false,
            createdAt: at(1),
            jottedAt: at(1),
            updatedAt: at(1),
        },
    ]
}

export function buildDemoCollections(): Collection[] {
    const now = DateTime.now().toUTC().toISO()
    const allTypes: ItemType[] = ["text", "todo", "link"]

    return [
        {
            id: nanoid(),
            createdAt: now,
            updatedAt: now,
            name: "Elden Ring",
            icon: "⚔️",
            slug: "elden-ring",
            sortOrder: 1000,
            tags: ["er"],
            types: allTypes,
        },
        {
            id: nanoid(),
            createdAt: now,
            updatedAt: now,
            name: "Chore",
            icon: "🧹",
            slug: "chore",
            sortOrder: 2000,
            tags: ["chore"],
            types: allTypes,
        },
        {
            id: nanoid(),
            createdAt: now,
            updatedAt: now,
            name: "Work",
            icon: "💼",
            slug: "work",
            sortOrder: 3000,
            tags: ["programming", "web"],
            types: allTypes,
        },
    ]
}

export function buildItem(creationData: MainInputCreationData): Item {
    const now = DateTime.now().toUTC().toISO()
    return {
        id: nanoid(),
        createdAt: now,
        jottedAt: now,
        updatedAt: now,
        tags: creationData.tags,
        type: creationData.itemType,
        content: creationData.content,
        title: creationData.title,
    }
}
