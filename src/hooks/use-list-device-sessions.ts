import type { Session, User } from "better-auth"
import { useCallback, useContext, useEffect, useRef, useState } from "react"

import { AuthUIContext } from "../lib/auth-ui-provider"

export function useListDeviceSessions() {
    const { authClient, toast } = useContext(AuthUIContext)
    const { data: sessionData, isPending: sessionPending } = authClient.useSession()

    const [data, setData] = useState<{ session: Session; user: User }[] | null>(null)
    const [isPending, setIsPending] = useState(true)
    const initialized = useRef(false)

    const refetch = useCallback(async () => {
        const { data, error } = await authClient.multiSession.listDeviceSessions()

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
