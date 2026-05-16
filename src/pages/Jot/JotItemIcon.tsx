import { useState } from "react"
import {
    IconNote,
    IconLink,
    IconWorld,
    IconSquare,
    IconCheckbox,
    IconHourglassLow,
} from "@tabler/icons-react"
import { isValidHexColourCode } from "@/utils/helpers"
import { ICON_PROPS_ITEM_ICON } from "@/config/constants"
import type { Item } from "@/types"
import styles from "./JotItemIcon.module.scss"

function FaviconIcon({ url }: { url: string }) {
    const [hasFailed, setHasFailed] = useState(false)
    if (hasFailed) return <IconLink {...ICON_PROPS_ITEM_ICON} />
    return (
        <img
            src={url}
            onError={() => setHasFailed(true)}
            className={styles.JotItemIcon__Favicon}
            alt=""
        />
    )
}

export function JotItemIcon({
    item,
    fetchingItemIds,
}: {
    item: Item
    fetchingItemIds: string[]
}) {
    if (fetchingItemIds.includes(item.id)) {
        return <IconHourglassLow {...ICON_PROPS_ITEM_ICON} />
    }

    if (item.type === "todo") {
        return item.isDone ? (
            <IconCheckbox {...ICON_PROPS_ITEM_ICON} />
        ) : (
            <IconSquare {...ICON_PROPS_ITEM_ICON} />
        )
    }
    if (item.type === "link") {
        if (item.faviconUrl) return <FaviconIcon url={item.faviconUrl} />
        return <IconWorld {...ICON_PROPS_ITEM_ICON} />
    }
    const lastSevenChars = item.content.slice(-7)
    if (isValidHexColourCode(lastSevenChars)) {
        return (
            <span
                className={styles.JotItemIcon__ColourBlock}
                style={{ backgroundColor: lastSevenChars }}
            />
        )
    }
    return <IconNote {...ICON_PROPS_ITEM_ICON} />
}
