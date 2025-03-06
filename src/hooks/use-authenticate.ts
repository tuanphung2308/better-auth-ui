import { useContext, useEffect } from "react"

import { AuthUIContext } from "../lib/auth-ui-provider"
import type { AuthView } from "../lib/auth-view-paths"

export function useAuthenticate(authView: AuthView = "signIn", enabled = true) {
    const { hooks, basePath, viewPaths, replace } = useContext(AuthUIContext)
    const { useSession } = hooks
    const { data: sessionData, isPending, ...rest } = useSession()

    useEffect(() => {
        if (enabled && !isPending && !sessionData) {
            replace(
                `${basePath}/${viewPaths[authView]}?redirectTo=${window.location.href.replace(window.location.origin, "")}`
            )
        }
    }, [enabled, isPending, sessionData, basePath, viewPaths, replace, authView])

    return { data: sessionData, isPending, user: sessionData?.user, ...rest }
}
