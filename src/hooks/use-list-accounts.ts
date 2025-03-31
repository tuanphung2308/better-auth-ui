import { useCallback, useContext, useEffect, useRef, useState } from "react"

import { AuthUIContext } from "../lib/auth-ui-provider"

export function useListAccounts() {
    const { authClient, toast } = useContext(AuthUIContext)
    const { data: sessionData, isPending: sessionPending } = authClient.useSession()

    const [data, setData] = useState<{ accountId: string; provider: string }[] | null>(null)
    const [isPending, setIsPending] = useState(true)
    const initialized = useRef(false)

    const refetch = useCallback(async () => {
        const { data, error } = await authClient.listAccounts()

        if (error) toast({ variant: "error", message: error.message || error.statusText })

        setData(data)
        setIsPending(false)
    }, [authClient, toast])

    useEffect(() => {
        if (!sessionData) {
            if (!sessionPending) setIsPending(false)

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
