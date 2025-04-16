import { useContext, useEffect } from "react"
import { AuthUIContext } from "../lib/auth-ui-provider"
import type { AuthView } from "../server"

interface AuthenticateOptions {
    authView?: AuthView
    enabled?: boolean
}

export function useAuthenticate(options?: AuthenticateOptions) {
    const { authView = "signIn", enabled = true } = options ?? {}

    const {
        hooks: { useSession },
        basePath,
        viewPaths,
        replace
    } = useContext(AuthUIContext)

    const { data: sessionData, isPending } = useSession()

    useEffect(() => {
        if (!enabled || isPending || sessionData) return

        replace(
            `${basePath}/${viewPaths[authView]}?redirectTo=${window.location.href.replace(window.location.origin, "")}`
        )
    }, [isPending, sessionData, basePath, viewPaths, replace, authView, enabled])
}
