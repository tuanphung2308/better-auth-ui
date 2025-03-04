import { useContext, useEffect } from "react"

import { AuthUIContext, type AuthView } from "../lib/auth-ui-provider"

export function useAuthenticate(authView: AuthView = "signIn", enabled = true) {
    const { hooks: { useSession }, basePath, viewPaths, replace } = useContext(AuthUIContext)
    const { data: sessionData, isPending, ...rest } = useSession()

    useEffect(() => {
        if (enabled && !isPending && !sessionData) {
            replace(`${basePath}/${viewPaths[authView]}?redirectTo=${window.location.href.replace(window.location.origin, "")}`)
        }
    }, [enabled, isPending, sessionData, basePath, viewPaths, replace, authView])

    return { data: sessionData, isPending, user: sessionData?.user, ...rest }
}