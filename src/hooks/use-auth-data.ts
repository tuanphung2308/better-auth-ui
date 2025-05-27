import { useCallback, useContext, useEffect, useRef, useState, useSyncExternalStore } from "react"

import { authDataCache } from "../lib/auth-data-cache"
import { AuthUIContext } from "../lib/auth-ui-provider"
import { getLocalizedError } from "../lib/utils"
import type { FetchError } from "../types/fetch-error"

export function useAuthData<T>({
    queryFn,
    cacheKey
}: {
    queryFn: () => Promise<{ data: T | null; error?: FetchError | null }>
    cacheKey?: string
}) {
    const { authClient, toast, localization } = useContext(AuthUIContext)
    const { data: sessionData, isPending: sessionPending } = authClient.useSession()

    // Generate a stable cache key based on the queryFn if not provided
    const queryFnRef = useRef(queryFn)
    queryFnRef.current = queryFn

    const stableCacheKey = cacheKey || queryFn.toString()

    // Subscribe to cache updates for this key
    const cacheEntry = useSyncExternalStore(
        useCallback(
            (callback) => authDataCache.subscribe(stableCacheKey, callback),
            [stableCacheKey]
        ),
        useCallback(() => authDataCache.get<T>(stableCacheKey), [stableCacheKey]),
        useCallback(() => authDataCache.get<T>(stableCacheKey), [stableCacheKey])
    )

    const initialized = useRef(false)
    const [error, setError] = useState<FetchError | null>(null)

    const refetch = useCallback(async () => {
        // Mark as refetching if we have cached data
        if (cacheEntry?.data !== undefined) {
            authDataCache.setRefetching(stableCacheKey, true)
        }

        try {
            const { data, error } = await queryFnRef.current()

            if (error) {
                setError(error)
                toast({
                    variant: "error",
                    message: getLocalizedError({ error, localization })
                })
            } else {
                setError(null)
            }

            // Update cache with new data
            authDataCache.set(stableCacheKey, data)
        } catch (err) {
            const error = err as FetchError
            setError(error)
            toast({
                variant: "error",
                message: getLocalizedError({ error, localization })
            })
        } finally {
            authDataCache.setRefetching(stableCacheKey, false)
        }
    }, [stableCacheKey, toast, localization, cacheEntry])

    useEffect(() => {
        if (!sessionData) {
            // Clear cache when session is lost
            authDataCache.clear(stableCacheKey)
            initialized.current = false
            return
        }

        // If we have cached data, we're not pending anymore
        const hasCachedData = cacheEntry?.data !== undefined

        if (!initialized.current || !hasCachedData) {
            initialized.current = true
            refetch()
        }
    }, [sessionData, stableCacheKey, refetch, cacheEntry])

    // Determine if we're in a pending state
    // We're only pending if:
    // 1. Session is still loading, OR
    // 2. We have no cached data and no error
    const isPending = sessionPending || (!cacheEntry?.data && !error)

    return {
        data: cacheEntry?.data ?? null,
        isPending,
        isRefetching: cacheEntry?.isRefetching ?? false,
        error,
        refetch
    }
}
