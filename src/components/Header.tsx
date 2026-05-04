import { Link, useMatch } from "react-router-dom"
import UserDropdown from "./UserDropdown"
import CollectionDropdown from "./CollectionDropdown"
import styles from "./Header.module.scss"
import {
    ROUTE_JOT,
    ROUTE_COLLECTION,
    ICON_PROPS_HEADER,
} from "@/config/constants"
import { IconPalette } from "@tabler/icons-react"
import { useCommandPaletteStore } from "@/store/commandPaletteStore"
import { useCurrentCollection } from "@/hooks/useCurrentCollection"

export default function Header() {
    const { currCollection } = useCurrentCollection()

    const isJotRoute = useMatch(ROUTE_JOT)
    const isJotCollectionRoute = useMatch(ROUTE_COLLECTION)
    const isOnJotPage = isJotRoute || isJotCollectionRoute
    const hasCurrentCollection = !!currCollection
    const shouldShowCollectionDropdown = isOnJotPage && hasCurrentCollection

    return (
        <header className={styles.Header}>
            <div className={styles.Header__Wrapper}>
                <div
                    className={`
                    ${styles.Header__Block}
                    ${styles["Header__Block--Left"]}
                `}
                >
                    <Link to={ROUTE_JOT} className={styles.Header__Logo}>
                        ai*jot
                    </Link>
                    {shouldShowCollectionDropdown && (
                        <>
                            <span className={styles.Header__Separator}>/</span>
                            <CollectionDropdown />
                        </>
                    )}
                </div>
                <div
                    className={`${styles.Header__Block} ${styles["Header__Block--FlexEnd"]}`}
                >
                    <button
                        className={styles.Header__BtnTheme}
                        onClick={() => {
                            useCommandPaletteStore.getState().open("theme")
                        }}
                    >
                        <IconPalette {...ICON_PROPS_HEADER} />
                    </button>
                    <UserDropdown />
                </div>
            </div>
        </header>
    )
}
