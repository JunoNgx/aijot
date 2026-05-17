import "./JotItemTextContent.scss"

export function JotItemTextContent({
    primaryText,
    secondaryText,
    isCopied,
    isDone,
}: {
    primaryText: string
    secondaryText: string | null
    isCopied: boolean
    isDone?: boolean
}) {
    const secondaryTextEl = secondaryText && (
        <span
            className="JotItemTextContent__SecondaryText"
            title={secondaryText}
        >
            {secondaryText}
        </span>
    )

    const primaryTextEl = primaryText && (
        <span
            className={`JotItemTextContent__PrimaryText${isDone ? " JotItemTextContent__PrimaryText--TodoDone" : ""}`}
            title={primaryText}
        >
            {primaryText}
        </span>
    )

    const copiedContent = (
        <span className="JotItemTextContent__PrimaryText JotItemTextContent__CopiedText">
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
            className="JotItemTextContent"
            key={isCopied ? "copied" : "normal"}
        >
            {isCopied ? copiedContent : regularContent}
        </div>
    )
}
