import type { Session } from "better-auth/types"
import { useCallback, useContext, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { AuthUIContext } from "../lib/auth-ui-provider"

export function useListSessions() {
    const { authClient } = useContext(AuthUIContext)
    const { data: sessionData, isPending: sessionPending } = authClient.useSession()

    const [sessions, setSessions] = useState<Session[] | null>(null)
    const [isPending, setIsPending] = useState(true)
    const initialized = useRef(false)

    const listSessions = useCallback(async () => {
        const { data, error } = await authClient.listSessions()

        if (error) toast.error(error.message || error.statusText)

        setSessions(data)
        setIsPending(false)
    }, [authClient])

    useEffect(() => {
        if (!sessionData) return

        if (initialized.current) return

        initialized.current = true
        listSessions()
    }, [listSessions, sessionData])

    return {
        sessions,
        isPending,
        refetch: listSessions,
        revokeSession: (token: string) => authClient.revokeSession({ token }),
        revokeOtherSessions: () => authClient.revokeOtherSessions()
    }
}
