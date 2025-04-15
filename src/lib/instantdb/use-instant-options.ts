import type { InstantReactWebDatabase } from "@instantdb/react"
import type { Session, User } from "../../types/auth-client"
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
    sessionData?: { user: User; session: Session }
    isPending: boolean
}

export function useInstantOptions({
    db,
    usePlural,
    modelNames,
    sessionData,
    isPending
}: UseInstantOptionsProps) {
    return {
        hooks: {
            useSession: () =>
                useInstantSession({
                    db,
                    modelNames,
                    usePlural,
                    sessionData,
                    isPending
                }),
            useListAccounts: () =>
                useListAccounts({
                    db,
                    modelNames,
                    usePlural,
                    sessionData,
                    isPending
                }),
            useListSessions: () =>
                useListSessions({
                    db,
                    modelNames,
                    usePlural,
                    sessionData,
                    isPending
                })
        } as AuthHooks
    }
}
