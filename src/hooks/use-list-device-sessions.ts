import type { Session, User } from "better-auth"
import {
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState
} from "react"
import { toast } from "sonner"

import { AuthUIContext } from "../lib/auth-ui-provider"
import type { FetchError } from "../types/fetch-error"

export function useListDeviceSessions() {
    const { authClient } = useContext(AuthUIContext)
    const { data: sessionData, isPending: sessionPending } = authClient.useSession()

    const [deviceSessions, setDeviceSessions] = useState<{ session: Session, user: User }[] | null>(null)
    const [activeSessionPending, setActiveSessionPending] = useState(false)
    const [isPending, setIsPending] = useState(true)
    const initialized = useRef(false)

    const listDeviceSessions = useCallback(async () => {
        // @ts-expect-error Optional plugin
        const { data, error } = await authClient.multiSession.listDeviceSessions()

        if (error) toast.error(error.message || error.statusText)

        setDeviceSessions(data)
        setIsPending(false)
    }, [authClient])

    useEffect(() => {
        if (!sessionData) {
            if (!sessionPending) setIsPending(false)

            return
        }

        if (initialized.current) return

        initialized.current = true
        listDeviceSessions()
    }, [listDeviceSessions, sessionData, sessionPending])

    const setActiveSession = async (sessionToken: string) => {
        setActiveSessionPending(true)

        // @ts-expect-error Optional plugin
        const { error } = await authClient?.multiSession.setActive({ sessionToken })

        setActiveSessionPending(false)

        return { error: error as FetchError | null | undefined }
    }

    return {
        deviceSessions,
        isPending,
        refetch: listDeviceSessions,
        setActiveSession,
        activeSessionPending
    }
}