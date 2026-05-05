import type { ReactNode, KeyboardEvent } from "react"
import styles from "./SettingsSection.module.scss"

interface Props {
    title: string
    description?: string
    children: ReactNode
    sectionClassName?: string
    titleClassName?: string
    onTitleClick?: () => void
    onTitleKeyDown?: (e: KeyboardEvent) => void
}

export default function SettingsSection({
    title,
    description,
    children,
    sectionClassName,
    titleClassName,
    onTitleClick,
    onTitleKeyDown,
}: Props) {
    return (
        <section
            className={[styles.Section, sectionClassName]
                .filter(Boolean)
                .join(" ")}
        >
            <h3
                className={[styles.Section__Title, titleClassName]
                    .filter(Boolean)
                    .join(" ")}
                onClick={onTitleClick}
                onKeyDown={onTitleKeyDown}
                tabIndex={onTitleClick ? 0 : undefined}
                role={onTitleClick ? "button" : undefined}
            >
                {title}
            </h3>
            {description && (
                <p className={styles.Section__Description}>{description}</p>
            )}
            {children}
        </section>
    )
}
