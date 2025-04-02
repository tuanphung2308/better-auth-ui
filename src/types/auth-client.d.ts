import { genericOAuthClient, multiSessionClient, passkeyClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

const authClient = createAuthClient({
    plugins: [multiSessionClient(), passkeyClient(), genericOAuthClient()]
})

export type AuthClient = typeof authClient
