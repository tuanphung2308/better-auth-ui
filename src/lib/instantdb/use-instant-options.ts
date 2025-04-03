import type { InstantReactWebDatabase } from "@instantdb/react"
import type { Session, User } from "better-auth"
import { useCallback, useMemo } from "react"
import type { AuthHooks } from "../../types/auth-hooks"

const namespaces = ["user", "session", "account", "passkey"] as const
type Namespace = (typeof namespaces)[number]

type ModelNames = {
    [key in Namespace]: string
}

const now = Date.now().toLocaleString()

export function useInstantOptions({
    db,
    sessionData,
    isPending,
    usePlural,
    modelNames
}: {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    db: InstantReactWebDatabase<any>
    sessionData?: { session: Session; user: User } | null
    isPending: boolean
    usePlural?: boolean
    modelNames?: Partial<ModelNames>
}) {
    const now = Date.now()
    const { user: authUser, isLoading: authLoading } = db.useAuth()

    const getModelName = useCallback(
        (namespace: Namespace) => {
            return modelNames?.[namespace] || `${namespace}${usePlural ? "s" : ""}`
        },
        [modelNames, usePlural]
    )

    const hooks = useMemo<Partial<AuthHooks>>(
        () => ({
            useSession: () => {
                const { data } = db.useQuery(
                    authUser
                        ? { [getModelName("user")]: { $: { where: { id: authUser?.id } } } }
                        : null
                )

                const user = useMemo(() => {
                    if (data?.[getModelName("user")]?.length) {
                        const user = data[getModelName("user")][0]
                        return {
                            ...user,
                            createdAt: new Date(user.createdAt as string),
                            updatedAt: new Date(user.updatedAt as string)
                        } as User
                    }
                    return null
                }, [data])

                return {
                    data: sessionData
                        ? { session: sessionData.session, user: user || sessionData.user }
                        : undefined,
                    isPending: isPending
                }
            },
            useListAccounts: () => {
                const { data, isLoading } = db.useQuery(
                    authUser
                        ? { [getModelName("account")]: { $: { where: { userId: authUser?.id } } } }
                        : null
                )

                const accounts = useMemo(() => {
                    if (data?.[getModelName("account")]?.length) {
                        return data[getModelName("account")].map((account) => ({
                            accountId: account.accountId as string,
                            provider: account.providerId as string
                        }))
                    }
                }, [data])

                return {
                    data: accounts,
                    isPending: isPending || authLoading || isLoading
                }
            },
            useListSessions: () => {
                const { data, isLoading } = db.useQuery(
                    authUser
                        ? {
                              [getModelName("session")]: {
                                  $: {
                                      where: {
                                          userId: authUser?.id,
                                          expiresAt: { $gte: now }
                                      }
                                  }
                              }
                          }
                        : null
                )

                const sessions = useMemo(() => {
                    if (data?.[getModelName("session")]?.length) {
                        return data[getModelName("session")].map((session) => ({
                            ...session,
                            expiresAt: new Date(session.expiresAt as string),
                            createdAt: new Date(session.createdAt as string),
                            updatedAt: new Date(session.updatedAt as string)
                        })) as Session[]
                    }
                }, [data])
                console.log("render")

                return { data: sessions, isPending: isLoading }
            }
        }),
        [db, sessionData, isPending, authLoading, getModelName, authUser, now]
    )

    return { hooks }
}
