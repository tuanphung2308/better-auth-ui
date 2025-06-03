import type { BetterFetchError } from "@better-fetch/fetch"
import type { Invitation } from "better-auth/plugins/organization"
import type { ApiKey } from "./api-key"
import type { AuthClient, Session, User } from "./auth-client"
import type { Refetch } from "./refetch"

type AuthHook<T> = {
    isPending: boolean
    data?: T | null
    error?: BetterFetchError | null
    refetch?: Refetch
}

export type AuthHooks = {
    useSession: () => ReturnType<AuthClient["useSession"]>
    useListAccounts: () => AuthHook<{ accountId: string; provider: string }[]>
    useListDeviceSessions: () => AuthHook<{ session: Session; user: User }[]>
    useListSessions: () => AuthHook<Session[]>
    useListPasskeys: () => ReturnType<AuthClient["useListPasskeys"]>
    useListApiKeys: () => AuthHook<ApiKey[]>
    useActiveOrganization: () => Partial<
        ReturnType<AuthClient["useActiveOrganization"]>
    >
    useListOrganizations: () => ReturnType<AuthClient["useListOrganizations"]>
    useHasPermission: (
        params: Parameters<AuthClient["organization"]["hasPermission"]>[0]
    ) => AuthHook<{
        error: null
        success: boolean
    }>
    useInvitation: (
        params: Parameters<AuthClient["organization"]["getInvitation"]>[0]
    ) => AuthHook<
        Invitation & {
            organizationName: string
            organizationSlug: string
            organizationLogo?: string
        }
    >
    useIsRestoring?: () => boolean
}
