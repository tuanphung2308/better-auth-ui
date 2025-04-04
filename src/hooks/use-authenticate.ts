import { useContext, useEffect } from "react"
import { AuthUIContext } from "../lib/auth-ui-provider"
import type { AuthView } from "../server"

export function useAuthenticate({
    authView = "signIn",
    enabled = true
}: { authView?: AuthView; enabled?: boolean }) {
    const {
        hooks: { useSession },
        basePath,
        viewPaths,
        replace
    } = useContext(AuthUIContext)
    const { data, isPending } = useSession()

    useEffect(() => {
        if (!enabled) return

        if (!isPending && !data) {
            replace(
                `${basePath}/${viewPaths[authView]}?redirectTo=${window.location.href.replace(window.location.origin, "")}`
            )
        }
    }, [isPending, data, basePath, viewPaths, replace, authView, enabled])
}
