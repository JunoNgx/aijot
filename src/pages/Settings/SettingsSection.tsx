import type { ReactNode, KeyboardEvent } from "react"
import "./SettingsSection.scss"

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
            className={
                sectionClassName
                    ? `SettingsSection ${sectionClassName}`
                    : "SettingsSection"
            }
        >
            <h3
                className={
                    titleClassName
                        ? `SettingsSection__Title ${titleClassName}`
                        : "SettingsSection__Title"
                }
                onClick={onTitleClick}
                onKeyDown={onTitleKeyDown}
                tabIndex={onTitleClick ? 0 : undefined}
                role={onTitleClick ? "button" : undefined}
            >
                {title}
            </h3>
            {description && (
                <p className="SettingsSection__Description">{description}</p>
            )}
            {children}
        </section>
    )
}
