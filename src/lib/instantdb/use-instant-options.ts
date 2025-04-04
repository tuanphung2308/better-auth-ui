import type { InstantReactWebDatabase } from "@instantdb/react"
import type { AuthHooks } from "../../types/auth-hooks"
import { useListAccounts } from "./use-list-accounts"
import { useListSessions } from "./use-list-sessions"
import { useSession as useInstantSession } from "./use-session"

const namespaces = ["user", "session", "account", "passkey"] as const
type Namespace = (typeof namespaces)[number]

type ModelNames = {
    [key in Namespace]: string
}

export interface UseInstantOptionsProps {
    // biome-ignore lint/suspicious/noExplicitAny:
    db: InstantReactWebDatabase<any>
    modelNames?: Partial<ModelNames>
    usePlural?: boolean
    useSession: AuthHooks["useSession"]
}

export function useInstantOptions({
    db,
    usePlural,
    modelNames,
    useSession
}: UseInstantOptionsProps) {
    return {
        hooks: {
            useSession: () =>
                useInstantSession({
                    db,
                    modelNames,
                    usePlural,
                    useSession
                }),
            useListAccounts: () =>
                useListAccounts({
                    db,
                    modelNames,
                    usePlural,
                    useSession
                }),
            useListSessions: () =>
                useListSessions({
                    db,
                    modelNames,
                    usePlural,
                    useSession
                })
        } as AuthHooks
    }
}
