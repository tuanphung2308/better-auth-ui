import { useContext, useEffect } from "react"
import { AuthUIContext } from "../lib/auth-ui-provider"
import type { AuthView } from "../server"

export function useAuthenticate(authView: AuthView = "signIn") {
    const { hooks, basePath, viewPaths, replace } = useContext(AuthUIContext)
    const { useSession } = hooks
    const { data, isPending } = useSession()

    useEffect(() => {
        if (!isPending && !data) {
            replace(
                `${basePath}/${viewPaths[authView]}?redirectTo=${window.location.href.replace(window.location.origin, "")}`
            )
        }
    }, [isPending, data, basePath, viewPaths, replace, authView])
}
