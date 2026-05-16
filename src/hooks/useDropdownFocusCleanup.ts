import { useCallback, useRef } from "react"
import type { KeyboardEvent } from "react"

/**
 * Prevents `:focus-visible` ring on Radix DropdownMenu triggers after
 * mouse/touch close. Radix calls `.focus()` on the trigger programmatically
 * on close, which the browser misidentifies as keyboard focus.
 *
 * Usage:
 *   const { triggerPointerDown, triggerKeyDown, contentCloseAutoFocus } =
 *       useDropdownFocusCleanup()
 *   <DropdownMenu.Trigger
 *       onPointerDown={triggerPointerDown}
 *       onKeyDown={triggerKeyDown}
 *   />
 *   <DropdownMenu.Content
 *       onCloseAutoFocus={contentCloseAutoFocus}
 *   />
 */
export function useDropdownFocusCleanup() {
    const isPointerOpenedRef = useRef(false)

    const triggerPointerDown = useCallback(() => {
        isPointerOpenedRef.current = true
    }, [])

    const triggerKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
            isPointerOpenedRef.current = false
        }
    }, [])

    const contentCloseAutoFocus = useCallback((e: Event) => {
        if (isPointerOpenedRef.current) {
            e.preventDefault()
        }
    }, [])

    return { triggerPointerDown, triggerKeyDown, contentCloseAutoFocus }
}
