import type { createAuthClient } from "better-auth/react"
import { useAuthenticate } from "../hooks/use-authenticate"
import type { AuthView } from "./auth-view-paths"

export function createAuthUIHooks<
    TAuthClient extends Omit<ReturnType<typeof createAuthClient>, "signUp">
>(_: TAuthClient) {
    return {
        useAuthenticate: (authView: AuthView = "signIn", enabled = true) => {
            return useAuthenticate<TAuthClient>(authView, enabled)
        }
    }
}
