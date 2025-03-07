import { useContext, useEffect } from "react"

import type { createAuthClient } from "better-auth/react"
import { AuthUIContext } from "../lib/auth-ui-provider"
import type { AuthView } from "../lib/auth-view-paths"

export function useAuthenticate<
    TAuthClient extends Omit<
        ReturnType<typeof createAuthClient>,
        "signUp"
    > = ReturnType<typeof createAuthClient>
>(authView: AuthView = "signIn", enabled = true) {
    const { hooks, basePath, viewPaths, replace } = useContext(AuthUIContext)
    const { useSession } = hooks
    const { data, isPending, ...rest } = useSession()

    useEffect(() => {
        if (enabled && !isPending && !data) {
            replace(
                `${basePath}/${viewPaths[authView]}?redirectTo=${window.location.href.replace(window.location.origin, "")}`
            )
        }
    }, [enabled, isPending, data, basePath, viewPaths, replace, authView])

    type SessionData = TAuthClient["$Infer"]["Session"] | undefined
    type User = TAuthClient["$Infer"]["Session"]["user"] | undefined
    type Session = TAuthClient["$Infer"]["Session"]["session"] | undefined
    const sessionData = data as SessionData
    const user = sessionData?.user as User
    const session = sessionData?.session as Session

    return {
        data: sessionData,
        isPending,
        ...rest,
        user,
        session
    }
}
