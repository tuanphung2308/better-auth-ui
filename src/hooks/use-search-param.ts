import { useEffect, useMemo, useState } from "react"

/**
 * Hook to safely access URL search parameters on the client-side
 * @param paramName The name of the search parameter to retrieve
 * @returns The value of the search parameter or undefined if not found or not hydrated
 */
export function useSearchParam(paramName: string): string | null | undefined {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    return useMemo(
        () => (isMounted ? new URLSearchParams(window.location.search).get(paramName) : undefined),
        [isMounted, paramName]
    )
}
