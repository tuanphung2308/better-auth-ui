import { useCallback, useContext, useEffect, useRef, useState } from "react"

import { AuthUIContext } from "../lib/auth-ui-provider"
import type { FetchError } from "../types/fetch-error"

export function useAuthData<T>({
    queryFn
}: {
    queryFn: () => Promise<{ data: T | null; error?: FetchError | null }>
}) {
    const { authClient, toast, localization } = useContext(AuthUIContext)
    const { data: sessionData, isPending: sessionPending } = authClient.useSession()

    const [data, setData] = useState<T | null>(null)
    const [isPending, setIsPending] = useState(true)
    const initialized = useRef(false)

    const refetch = useCallback(async () => {
        const { data, error } = await queryFn()

        if (error)
            toast({
                variant: "error",
                message: error.message || error.statusText || localization.requestFailed
            })

        setData(data)
        setIsPending(false)
    }, [queryFn, toast, localization])

    useEffect(() => {
        if (!sessionData) {
            setIsPending(sessionPending)
            setData(null) // Reset data when session is null
            initialized.current = false
            return
        }

        if (initialized.current) return

        initialized.current = true
        refetch()
    }, [refetch, sessionData, sessionPending])

    return {
        data,
        isPending,
        refetch
    }
}
