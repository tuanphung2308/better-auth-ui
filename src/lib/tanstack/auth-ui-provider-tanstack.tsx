import { AuthQueryContext, createAuthHooks } from "@daveyplate/better-auth-tanstack"
import { useQueryClient } from "@tanstack/react-query"
import { useContext } from "react"

import { AuthUIProvider, type AuthUIProviderProps } from "../../lib/auth-ui-provider"
import type { AuthHooks } from "../../types/auth-hooks"
import type { AuthMutates } from "../../types/auth-mutates"

export function AuthUIProviderTanstack({
    children,
    authClient,
    onSessionChange,
    optimistic = true,
    ...props
}: AuthUIProviderProps) {
    const {
        useUnlinkAccount,
        useUpdateUser,
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
    const { sessionKey } = useContext(AuthQueryContext)

    const hooks: AuthHooks = createAuthHooks(authClient)

    const mutates: AuthMutates = {
        updateUser: (params) => updateUserAsync({ fetchOptions: { throw: false }, ...params }),
        unlinkAccount: (params) =>
            unlinkAccountAsync({ fetchOptions: { throw: false }, ...params }),
        deletePasskey: (params) =>
            deletePasskeyAsync({ fetchOptions: { throw: false }, ...params }),
        revokeSession: (params) =>
            revokeSessionAsync({ fetchOptions: { throw: false }, ...params }),
        setActiveSession: (params) =>
            setActiveSessionAsync({ fetchOptions: { throw: false }, ...params }),
        revokeDeviceSession: (params) =>
            revokeDeviceSessionAsync({ fetchOptions: { throw: false }, ...params })
    }

    return (
        <AuthUIProvider
            authClient={authClient}
            hooks={hooks}
            mutates={mutates}
            onSessionChange={async () => {
                await queryClient.refetchQueries({ queryKey: sessionKey })

                setTimeout(() =>
                    queryClient.invalidateQueries({
                        predicate: (query) => query.queryKey !== sessionKey
                    })
                )

                await onSessionChange?.()
            }}
            optimistic={optimistic}
            {...props}
        >
            {children}
        </AuthUIProvider>
    )
}
