import "./JotItemCompactBody.scss"

export function JotItemCompactBody({
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
            className="JotItemCompactBody__SecondaryText"
            title={secondaryText}
        >
            {secondaryText}
        </span>
    )

    const primaryTextEl = primaryText && (
        <span
            className={`JotItemCompactBody__PrimaryText${isDone ? " JotItemCompactBody__PrimaryText--TodoDone" : ""}`}
            title={primaryText}
        >
            {primaryText}
        </span>
    )

    const copiedContent = (
        <span className="JotItemCompactBody__PrimaryText JotItemCompactBody__CopiedText">
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
            className="JotItemCompactBody"
            key={isCopied ? "copied" : "normal"}
        >
            {isCopied ? copiedContent : regularContent}
        </div>
    )
}
