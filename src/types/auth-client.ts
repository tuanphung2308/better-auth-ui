import type {
    anonymousClient,
    genericOAuthClient,
    multiSessionClient,
    passkeyClient
} from "better-auth/client/plugins"
import type { createAuthClient } from "better-auth/react"

// Define the return type of each plugin function
type MultiSessionClientPlugin = ReturnType<typeof multiSessionClient>
type PasskeyClientPlugin = ReturnType<typeof passkeyClient>
type GenericOAuthClientPlugin = ReturnType<typeof genericOAuthClient>
type AnonymousClientPlugin = ReturnType<typeof anonymousClient>

// Define the AuthClient type with all the plugins applied
export type AuthClient = ReturnType<
    typeof createAuthClient<{
        plugins: [
            MultiSessionClientPlugin,
            PasskeyClientPlugin,
            GenericOAuthClientPlugin,
            AnonymousClientPlugin
        ]
    }>
>

export type Session = AuthClient["$Infer"]["Session"]["session"]
export type User = AuthClient["$Infer"]["Session"]["user"]
