import { useContext } from "react"

import { AuthUIContext } from "../lib/auth-ui-provider"

export function useSession() {
    const { authClient } = useContext(AuthUIContext)

    const { data, isPending, refetch } = authClient.useSession()

    return {
        data,
        isPending,
        refetch,
        updateUser: (fields: Record<string, unknown>) => authClient.updateUser(fields)
    }
}