import styles from "./JotItemTextContent.module.scss"

export function JotItemTextContent({
    primaryText,
    secondaryText,
    isCopied,
    isDone,
    isPrimaryTextTitle,
}: {
    primaryText: string
    secondaryText: string | null
    isCopied: boolean
    isDone?: boolean
    isPrimaryTextTitle: boolean
}) {
    const secondaryTextEl = secondaryText && (
        <span className={styles.JotItemTextContent__SecondaryText}>
            {secondaryText}
        </span>
    )

    const primaryTextEl = (
        <span
            className={`
                ${styles.JotItemTextContent__PrimaryText}
                ${isDone ? styles["JotItemTextContent__PrimaryText--TodoDone"] : ""}
                ${isPrimaryTextTitle ? styles["JotItemTextContent__PrimaryText--Title"] : ""}
            `}
        >
            {primaryText}
        </span>
    )

    const copiedContent = (
        <span
            className={`
                ${styles.JotItemTextContent__PrimaryText}
                ${styles.JotItemTextContent__CopiedText}
            `}
        >
            Copied
        </span>
    )

    const regularContent = (
        <>
            {primaryTextEl}
            {secondaryTextEl}
        </>
    )

    return (
        <div
            className={styles.JotItemTextContent}
            key={isCopied ? "copied" : "normal"}
        >
            {isCopied ? copiedContent : regularContent}
        </div>
    )
}
