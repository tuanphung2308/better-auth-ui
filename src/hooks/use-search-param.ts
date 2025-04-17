import { useMemo } from "react"
import { useIsHydrated } from "./use-hydrated"

/**
 * Hook to safely access URL search parameters on the client-side
 * @param paramName The name of the search parameter to retrieve
 * @returns The value of the search parameter or undefined if not found or not hydrated
 */
export function useSearchParam(paramName: string): string | null | undefined {
    const isHydrated = useIsHydrated()

    return useMemo(
        () => (isHydrated ? new URLSearchParams(window.location.search).get(paramName) : undefined),
        [isHydrated, paramName]
    )
}
