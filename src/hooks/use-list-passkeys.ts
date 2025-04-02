import { useContext } from "react"

import { AuthUIContext } from "../lib/auth-ui-provider"

export function useListPasskeys() {
    const { authClient } = useContext(AuthUIContext)
    return authClient.useListPasskeys()
}
