import { useCallback, useContext, useEffect, useState } from "react"
import { toast } from "sonner"

import { AuthUIContext } from "../lib/auth-ui-provider"

type Account = {
    id: string
    provider: string
}

export function useListAccounts() {
    const { authClient } = useContext(AuthUIContext)
    const { data: sessionData, isPending: sessionPending } = authClient.useSession()

    const [accounts, setAccounts] = useState<Account[] | null>(null)
    const [isPending, setIsPending] = useState(true)

    const listAccounts = useCallback(async () => {
        const { data, error } = await authClient.listAccounts()

        if (error) toast.error(error.message || error.statusText)

        setAccounts(data)
        setIsPending(false)
    }, [authClient])

    useEffect(() => {
        if (!sessionData) {
            if (!sessionPending) setIsPending(false)

            return
        }

        listAccounts()
    }, [listAccounts, sessionData, sessionPending])

    return { accounts, isPending, refetch: listAccounts }
}