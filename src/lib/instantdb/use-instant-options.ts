import type { InstantReactWebDatabase } from "@instantdb/react"
import type { Session, User } from "../../types/auth-client"
import type { AuthHooks } from "../../types/auth-hooks"
import type { AuthMutators } from "../../types/auth-mutators"
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
    user?: { id: string } | null
    isPending: boolean
}

export function useInstantOptions({
    db,
    usePlural,
    modelNames,
    sessionData,
    isPending,
    user
}: UseInstantOptionsProps) {
    const userId = user?.id || sessionData?.user.id

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
        } as AuthHooks,
        mutators: {
            updateUser: async (data) => {
                if (!userId) {
                    throw new Error("Unauthenticated")
                }

                db.transact([
                    db.tx.users[userId].update({
                        ...data,
                        updatedAt: Date.now()
                    })
                ])
            }
        } as AuthMutators
    }
}
