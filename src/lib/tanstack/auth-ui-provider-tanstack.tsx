import { createAuthHooks } from "@daveyplate/better-auth-tanstack"
import { useIsRestoring, useQueryClient } from "@tanstack/react-query"
import type { ReactNode } from "react"

import { AuthUIProvider, type AuthUIProviderProps } from "../../lib/auth-ui-provider"

export function AuthUIProviderTanstack({
    children,
    authClient,
    onSessionChange,
    optimistic = true,
    ...props
}: {
    children: ReactNode
} & AuthUIProviderProps) {
    const {
        useListAccounts,
        useUnlinkAccount,
        useListDeviceSessions,
        useListSessions,
        useSession,
        useUpdateUser,
        useListPasskeys,
        useDeletePasskey,
        useRevokeSession,
        useRevokeDeviceSession,
        useSetActiveSession
    } = createAuthHooks(authClient)
    const queryClient = useQueryClient()

    const { updateUserAsync } = useUpdateUser()
    const { deletePasskeyAsync } = useDeletePasskey()
    const { unlinkAccountAsync } = useUnlinkAccount()
    const { revokeSessionAsync } = useRevokeSession()
    const { revokeDeviceSessionAsync } = useRevokeDeviceSession()
    const { setActiveSessionAsync } = useSetActiveSession()

    const hooks = {
        useIsRestoring,
        useListAccounts,
        useListDeviceSessions,
        useListSessions,
        useListPasskeys,
        useSession
    }

    const mutates = {
        updateUser: (params: Parameters<typeof updateUserAsync>[0]) =>
            updateUserAsync({ fetchOptions: { throw: false }, ...params }),
        unlinkAccount: (params: Parameters<typeof unlinkAccountAsync>[0]) =>
            unlinkAccountAsync({ fetchOptions: { throw: false }, ...params }),
        deletePasskey: (params: Parameters<typeof deletePasskeyAsync>[0]) =>
            deletePasskeyAsync({ fetchOptions: { throw: false }, ...params }),
        revokeSession: (params: Parameters<typeof revokeSessionAsync>[0]) =>
            revokeSessionAsync({ fetchOptions: { throw: false }, ...params }),
        setActiveSession: (params: Parameters<typeof setActiveSessionAsync>[0]) =>
            setActiveSessionAsync({ fetchOptions: { throw: false }, ...params }),
        revokeDeviceSession: (params: Parameters<typeof revokeDeviceSessionAsync>[0]) =>
            revokeDeviceSessionAsync({ fetchOptions: { throw: false }, ...params })
    }

    return (
        <AuthUIProvider
            authClient={authClient}
            // @ts-ignore
            hooks={hooks}
            // @ts-ignore
            mutates={mutates}
            onSessionChange={() => {
                queryClient.resetQueries()
                onSessionChange?.()
            }}
            optimistic={optimistic}
            {...props}
        >
            {children}
        </AuthUIProvider>
    )
}
